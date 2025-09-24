import { supabase } from "../../lib/supabase";
import { getWebhookUrl } from "../../lib/webhooks";

export class FollowUpService {
	/**
	 * Check if student meets enrollment conditions for follow-up
	 * Condition 1: Student has enrollment record but NOT with statuses: paid, welcome_package_sent, dropped_out, declined_contract
	 */
	async checkEnrollmentConditions(studentId: string): Promise<boolean> {
		// Check if student has any enrollment records
		const { data: allEnrollments, error: enrollmentError } = await supabase
			.from("enrollments")
			.select("id, status")
			.eq("student_id", studentId);

		if (enrollmentError) {
			console.error("Error checking enrollments:", enrollmentError);
			return false;
		}

		// No enrollments at all - doesn't meet condition
		if (!allEnrollments || allEnrollments.length === 0) {
			return false;
		}

		// Check if student has any enrollment with restricted statuses
		const restrictedStatuses = [
			"paid",
			"welcome_package_sent",
			"dropped_out",
			"declined_contract",
		];
		const hasRestrictedStatus = allEnrollments.some((enrollment) =>
			restrictedStatuses.includes(enrollment.status),
		);

		// Student has enrollments but none with restricted statuses - meets condition
		return !hasRestrictedStatus;
	}

	/**
	 * Check if student has active follow-ups
	 * Condition 2: Student doesn't have any automated follow-up record with status: activated, ongoing
	 */
	async checkExistingFollowUps(studentId: string): Promise<boolean> {
		const { data: activeFollowUps, error } = await supabase
			.from("automated_follow_ups")
			.select("id, status")
			.eq("student_id", studentId)
			.in("status", ["activated", "ongoing"]);

		if (error) {
			console.error("Error checking existing follow-ups:", error);
			return false;
		}

		// No active follow-ups - meets condition
		return !activeFollowUps || activeFollowUps.length === 0;
	}

	/**
	 * Find follow-up sequence by backend name
	 */
	async findSequenceByBackendName(backendName: string) {
		const { data: sequence, error } = await supabase
			.from("template_follow_up_sequences")
			.select("*")
			.eq("backend_name", backendName)
			.single();

		if (error) {
			console.error("Error finding sequence:", error);
			return null;
		}

		return sequence;
	}

	/**
	 * Create automated follow-up record
	 */
	async createFollowUp(studentId: string, sequenceId: string) {
		const now = new Date().toISOString();

		const { data: followUp, error } = await supabase
			.from("automated_follow_ups")
			.insert({
				student_id: studentId,
				sequence_id: sequenceId,
				current_step: 1,
				status: "activated",
				started_at: now,
				created_at: now,
				updated_at: now,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating follow-up:", error);
			throw new Error("Failed to create follow-up record");
		}

		return followUp;
	}

	/**
	 * Set follow-up for a student
	 * Main method that checks all conditions and creates follow-up if eligible
	 */
	async setFollowUp(studentId: string, sequenceBackendName: string) {
		// Find the sequence first
		const sequence = await this.findSequenceByBackendName(sequenceBackendName);
		if (!sequence) {
			return {
				success: false,
				error: "Follow-up sequence not found",
				code: "SEQUENCE_NOT_FOUND",
			};
		}

		// Check enrollment conditions
		const meetsEnrollmentConditions =
			await this.checkEnrollmentConditions(studentId);
		if (!meetsEnrollmentConditions) {
			return {
				success: false,
				error: "Student does not meet enrollment conditions",
				code: "ENROLLMENT_CONDITIONS_NOT_MET",
				details:
					"Student either has no enrollments or has enrollment with status: paid, welcome_package_sent, dropped_out, or declined_contract",
			};
		}

		// Check existing follow-ups
		const canCreateFollowUp = await this.checkExistingFollowUps(studentId);
		if (!canCreateFollowUp) {
			return {
				success: false,
				error: "Student already has active follow-up",
				code: "ACTIVE_FOLLOW_UP_EXISTS",
				details:
					"Student has an automated follow-up with status: activated or ongoing",
			};
		}

		// All conditions met - create the follow-up
		try {
			const followUp = await this.createFollowUp(studentId, sequence.id);

			return {
				success: true,
				data: {
					follow_up_id: followUp.id,
					student_id: followUp.student_id,
					sequence_id: followUp.sequence_id,
					status: followUp.status,
					started_at: followUp.started_at,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: "Failed to create follow-up",
				code: "CREATE_FAILED",
				details: error,
			};
		}
	}

	/**
	 * Get all follow-up sequences
	 */
	async getAllSequences() {
		const { data: sequences, error } = await supabase
			.from("template_follow_up_sequences")
			.select("*")
			.order("display_name");

		if (error) {
			console.error("Error fetching sequences:", error);
			return [];
		}

		return sequences || [];
	}

	/**
	 * Get student's follow-up history
	 */
	async getStudentFollowUps(studentId: string) {
		const { data: followUps, error } = await supabase
			.from("automated_follow_ups")
			.select(
				`
				*,
				template_follow_up_sequences (
					id,
					display_name,
					subject,
					backend_name
				)
			`,
			)
			.eq("student_id", studentId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching student follow-ups:", error);
			return [];
		}

		return followUps || [];
	}

	/**
	 * Find the next template message for a follow-up
	 */
	async findNextTemplateMessage(followUpId: string) {
		// First get the follow-up with its current step and sequence
		const { data: followUp, error: followUpError } = await supabase
			.from("automated_follow_ups")
			.select("id, current_step, sequence_id, status")
			.eq("id", followUpId)
			.single();

		if (followUpError || !followUp) {
			console.error("Error fetching follow-up:", followUpError);
			return null;
		}

		// Find template message with step_index = current_step
		const nextStepIndex = followUp.current_step || 1;
		const { data: nextMessage, error: messageError } = await supabase
			.from("template_follow_up_messages")
			.select("*")
			.eq("sequence_id", followUp.sequence_id)
			.eq("step_index", nextStepIndex)
			.eq("status", "active")
			.single();

		if (messageError) {
			// No next message found (this is expected when sequence is complete)
			if (messageError.code === "PGRST116") {
				return null;
			}
			console.error("Error fetching next message:", messageError);
			return null;
		}

		return nextMessage;
	}

	/**
	 * Advance follow-up to next step or mark as completed
	 */
	async advanceFollowUp(followUpId: string) {
		// Get current follow-up state
		const { data: followUp, error: followUpError } = await supabase
			.from("automated_follow_ups")
			.select("*")
			.eq("id", followUpId)
			.single();

		if (followUpError || !followUp) {
			return {
				success: false,
				error: "Follow-up not found",
				code: "FOLLOW_UP_NOT_FOUND",
			};
		}

		// Check if follow-up is in a valid state to advance
		if (!["activated", "ongoing"].includes(followUp.status)) {
			return {
				success: false,
				error: `Cannot advance follow-up with status: ${followUp.status}`,
				code: "INVALID_STATUS",
				details:
					"Follow-up must have status 'activated' or 'ongoing' to advance",
			};
		}

		// Check if there's a next message
		const nextMessage = await this.findNextTemplateMessage(followUpId);
		const now = new Date().toISOString();

		if (nextMessage) {
			// Advance to next step
			const newStep = followUp.current_step + 1;
			const newStatus =
				followUp.current_step === 1 ? "ongoing" : followUp.status;

			const { data: updatedFollowUp, error: updateError } = await supabase
				.from("automated_follow_ups")
				.update({
					current_step: newStep,
					status: newStatus,
					last_message_sent_at: now,
					updated_at: now,
				})
				.eq("id", followUpId)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating follow-up:", updateError);
				return {
					success: false,
					error: "Failed to advance follow-up",
					code: "UPDATE_FAILED",
					details: updateError,
				};
			}

			return {
				success: true,
				data: {
					follow_up_id: updatedFollowUp.id,
					current_step: updatedFollowUp.current_step,
					status: updatedFollowUp.status,
					next_message: {
						id: nextMessage.id,
						step_index: nextMessage.step_index,
						message_content: nextMessage.message_content,
						time_delay_hours: nextMessage.time_delay_hours,
					},
				},
			};
		}
		// No next message - mark as completed
		const { data: completedFollowUp, error: completeError } = await supabase
			.from("automated_follow_ups")
			.update({
				status: "completed",
				completed_at: now,
				updated_at: now,
			})
			.eq("id", followUpId)
			.select()
			.single();

		if (completeError) {
			console.error("Error completing follow-up:", completeError);
			return {
				success: false,
				error: "Failed to complete follow-up",
				code: "COMPLETE_FAILED",
				details: completeError,
			};
		}

		return {
			success: true,
			data: {
				follow_up_id: completedFollowUp.id,
				status: "completed",
				completed_at: completedFollowUp.completed_at,
				message: "Follow-up sequence completed",
			},
		};
	}

	/**
	 * Stop all active follow-ups for a student
	 */
	async stopAllFollowUps(studentId: string) {
		// Find all active follow-ups for this student
		const { data: activeFollowUps, error: fetchError } = await supabase
			.from("automated_follow_ups")
			.select("id, status")
			.eq("student_id", studentId)
			.in("status", ["activated", "ongoing"]);

		if (fetchError) {
			console.error("Error fetching active follow-ups:", fetchError);
			return {
				success: false,
				error: "Failed to fetch active follow-ups",
				code: "FETCH_FAILED",
				details: fetchError,
			};
		}

		if (!activeFollowUps || activeFollowUps.length === 0) {
			return {
				success: true,
				message: "No active follow-ups to stop",
				stopped_count: 0,
			};
		}

		// Update all active follow-ups to disabled status
		const now = new Date().toISOString();
		const followUpIds = activeFollowUps.map((f) => f.id);

		const { data: stoppedFollowUps, error: updateError } = await supabase
			.from("automated_follow_ups")
			.update({
				status: "disabled",
				updated_at: now,
			})
			.in("id", followUpIds)
			.select();

		if (updateError) {
			console.error("Error stopping follow-ups:", updateError);
			return {
				success: false,
				error: "Failed to stop follow-ups",
				code: "UPDATE_FAILED",
				details: updateError,
			};
		}

		return {
			success: true,
			message: `Successfully stopped ${stoppedFollowUps.length} follow-up(s)`,
			stopped_count: stoppedFollowUps.length,
			stopped_follow_ups: stoppedFollowUps.map((f) => ({
				id: f.id,
				previous_status: activeFollowUps.find((af) => af.id === f.id)?.status,
				new_status: f.status,
			})),
		};
	}

	/**
	 * Find follow-ups ready to send next message and trigger webhooks
	 */
	async triggerNextMessages() {
		try {
			// Query the view to find follow-ups ready to send next message
			const { data: followUps, error: queryError } = await supabase
				.from("automated_follow_ups_with_schedule")
				.select("*")
				.lte("next_message_scheduled_at", new Date().toISOString())
				.not("next_message_scheduled_at", "is", null)
				.eq("has_next_message", true)
				.in("status", ["activated", "ongoing"])
				.order("next_message_scheduled_at", { ascending: true });

			if (queryError) {
				console.error("Error fetching follow-ups:", queryError);
				return {
					success: false,
					error: "Failed to fetch follow-ups",
					details: queryError,
				};
			}

			if (!followUps || followUps.length === 0) {
				return {
					success: true,
					message: "No follow-ups ready to send messages",
					processed: 0,
					timestamp: new Date().toISOString(),
				};
			}

			// Process each follow-up
			const results: Array<{
				recordId: string;
				success: boolean;
				error?: string;
				statusCode?: number;
			}> = [];

			for (const followUp of followUps) {
				// Trigger make.com webhook with recordID as URL parameter
				try {
					// Get webhook URL from centralized configuration
					const webhookUrl = getWebhookUrl("make", "followUpTriggered");
					if (!webhookUrl) {
						results.push({
							recordId: followUp.id,
							success: false,
							error: "Webhook URL not configured",
						});
						continue;
					}

					const webhookUrlWithParam = `${webhookUrl}?recordID=${followUp.id}`;

					const response = await fetch(webhookUrlWithParam, {
						method: "GET", // Using GET with URL param
						headers: {
							"User-Agent": "FLS-Automated-Follow-Up/1.0",
						},
					});

					results.push({
						recordId: followUp.id,
						success: response.ok,
						statusCode: response.status,
						error: !response.ok
							? `HTTP ${response.status}: ${response.statusText}`
							: undefined,
					});

					if (response.ok) {
						console.log(
							`Successfully triggered webhook for record: ${followUp.id}`,
						);
					} else {
						console.error(
							`Failed to trigger webhook for record: ${followUp.id}, status: ${response.status}`,
						);
					}

					// Add small delay to avoid overwhelming make.com
					await new Promise((resolve) => setTimeout(resolve, 100));
				} catch (webhookError) {
					const errorMessage =
						webhookError instanceof Error
							? webhookError.message
							: "Unknown error";
					console.error(
						`Error triggering webhook for record ${followUp.id}:`,
						errorMessage,
					);

					results.push({
						recordId: followUp.id,
						success: false,
						error: errorMessage,
					});
				}
			}

			// Summary statistics
			const successful = results.filter((r) => r.success).length;
			const failed = results.filter((r) => !r.success).length;

			return {
				success: true,
				message: `Processed ${followUps.length} follow-ups`,
				summary: {
					total: followUps.length,
					successful,
					failed,
				},
				results,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error("Error in triggerNextMessages:", error);
			return {
				success: false,
				error: "Internal error triggering messages",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Check recent engagements (touchpoints and assessments) and stop follow-ups for those students
	 */
	async checkRecentEngagementsToStop(hoursBack = 1) {
		try {
			// Calculate the timestamp for X hours ago
			const cutoffTime = new Date();
			cutoffTime.setHours(cutoffTime.getHours() - hoursBack);
			const cutoffTimeISO = cutoffTime.toISOString();

			// Find all outbound touchpoints created after the cutoff time
			const { data: recentTouchpoints, error: touchpointError } = await supabase
				.from("touchpoints")
				.select("student_id, created_at, type, channel")
				.eq("type", "outbound")
				.gte("created_at", cutoffTimeISO)
				.order("created_at", { ascending: false });

			if (touchpointError) {
				console.error("Error fetching recent touchpoints:", touchpointError);
				return {
					success: false,
					error: "Failed to fetch recent touchpoints",
					details: touchpointError,
				};
			}

			// Find all assessments created (booked) after the cutoff time
			const { data: recentAssessments, error: assessmentError } = await supabase
				.from("student_assessments")
				.select("student_id, created_at, scheduled_for, result")
				.gte("created_at", cutoffTimeISO)
				.order("created_at", { ascending: false });

			if (assessmentError) {
				console.error("Error fetching recent assessments:", assessmentError);
				return {
					success: false,
					error: "Failed to fetch recent assessments",
					details: assessmentError,
				};
			}

			// Combine student IDs from both touchpoints and assessments
			const touchpointStudentIds =
				recentTouchpoints?.map((tp) => tp.student_id) || [];
			const assessmentStudentIds =
				recentAssessments?.map((a) => a.student_id) || [];
			const allStudentIds = [...touchpointStudentIds, ...assessmentStudentIds];
			const uniqueStudentIds = [...new Set(allStudentIds)];

			if (uniqueStudentIds.length === 0) {
				return {
					success: true,
					message: `No engagements found in the last ${hoursBack} hour(s)`,
					touchpointsFound: 0,
					assessmentsFound: 0,
					studentsProcessed: 0,
					followUpsStopped: 0,
					timestamp: new Date().toISOString(),
				};
			}

			console.log(
				`Found ${recentTouchpoints?.length || 0} touchpoints and ${
					recentAssessments?.length || 0
				} assessments for ${uniqueStudentIds.length} unique students`,
			);

			// Process each student using the existing stopAllFollowUps function
			const results = [];
			let totalFollowUpsStopped = 0;

			for (const studentId of uniqueStudentIds) {
				// Call the existing stopAllFollowUps function for each student
				const stopResult = await this.stopAllFollowUps(studentId);

				const studentTouchpoints =
					recentTouchpoints?.filter((tp) => tp.student_id === studentId) || [];
				const studentAssessments =
					recentAssessments?.filter((a) => a.student_id === studentId) || [];

				results.push({
					studentId,
					engagements: {
						touchpointsCount: studentTouchpoints.length,
						latestTouchpoint: studentTouchpoints[0]?.created_at,
						touchpointTypes: [
							...new Set(studentTouchpoints.map((tp) => tp.type)),
						],
						assessmentsCount: studentAssessments.length,
						latestAssessment: studentAssessments[0]?.created_at,
						assessmentScheduledFor: studentAssessments[0]?.scheduled_for,
					},
					stopResult: {
						success: stopResult.success,
						followUpsStopped: stopResult.stopped_count || 0,
						message: stopResult.message,
					},
				});

				if (stopResult.success && stopResult.stopped_count) {
					totalFollowUpsStopped += stopResult.stopped_count;
				}
			}

			return {
				success: true,
				message: `Checked ${uniqueStudentIds.length} students with recent engagements, stopped ${totalFollowUpsStopped} follow-ups`,
				summary: {
					hoursBack,
					cutoffTime: cutoffTimeISO,
					touchpointsFound: recentTouchpoints?.length || 0,
					assessmentsFound: recentAssessments?.length || 0,
					studentsProcessed: uniqueStudentIds.length,
					followUpsStopped: totalFollowUpsStopped,
				},
				studentResults: results,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error("Error in checkRecentEngagementsToStop:", error);
			return {
				success: false,
				error: "Internal error checking recent engagements",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Find students that need automated follow-ups based on criteria:
	 * 1. Student is not a full beginner
	 * 2. Student record created within last 24 hours
	 * 3. No touchpoint mentioning "assessment" in last 24 hours
	 *
	 * Then trigger the follow-up flow for these students
	 */
	async findAndTriggerStudentFollowUps() {
		try {
			// Calculate 24 hours ago
			const twentyFourHoursAgo = new Date();
			twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
			const twentyFourHoursAgoISO = twentyFourHoursAgo.toISOString();

			// Find students created in last 24 hours who are not full beginners
			const { data: recentStudents, error: studentError } = await supabase
				.from("students")
				.select(
					"id, first_name, last_name, email, mobile_phone_number, is_full_beginner, created_at",
				)
				.gte("created_at", twentyFourHoursAgoISO)
				.eq("is_full_beginner", false); // Not full beginner

			if (studentError) {
				console.error("Error fetching recent students:", studentError);
				return {
					success: false,
					error: "Failed to fetch recent students",
					details: studentError,
				};
			}

			if (!recentStudents || recentStudents.length === 0) {
				return {
					success: true,
					message: "No students found matching criteria",
					processed: 0,
					timestamp: new Date().toISOString(),
				};
			}

			// For each student, check if they have any touchpoint mentioning assessment in last 24 hours
			const studentsNeedingFollowUp = [];

			for (const student of recentStudents) {
				// Check for recent touchpoints that indicate assessment activity
				const { data: touchpoints, error: touchpointError } = await supabase
					.from("touchpoints")
					.select("id, message")
					.eq("student_id", student.id)
					.gte("created_at", twentyFourHoursAgoISO)
					.ilike("message", "%assessment%")
					.limit(1);

				if (touchpointError) {
					console.error(
						`Error checking touchpoints for student ${student.id}:`,
						touchpointError,
					);
					continue;
				}

				// If no recent assessment-related touchpoint, add to follow-up list
				if (!touchpoints || touchpoints.length === 0) {
					studentsNeedingFollowUp.push(student);
				}
			}

			if (studentsNeedingFollowUp.length === 0) {
				return {
					success: true,
					message:
						"No students need follow-ups (all have recent assessment-related touchpoints)",
					processed: 0,
					studentsChecked: recentStudents.length,
					timestamp: new Date().toISOString(),
				};
			}

			// Set follow-ups for these students
			const results = [];

			for (const student of studentsNeedingFollowUp) {
				try {
					// Use the existing setFollowUp method to create follow-up
					const followUpResult = await this.setFollowUp(student.id, "default");

					results.push({
						studentId: student.id,
						studentName: `${student.first_name} ${student.last_name}`,
						success: followUpResult.success,
						followUpId: followUpResult.data?.follow_up_id,
						error: followUpResult.error,
						code: followUpResult.code,
					});
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : "Unknown error";
					results.push({
						studentId: student.id,
						studentName: `${student.first_name} ${student.last_name}`,
						success: false,
						error: errorMessage,
					});
				}
			}

			// Summary
			const successful = results.filter((r) => r.success).length;
			const failed = results.filter((r) => !r.success).length;

			return {
				success: true,
				message: `Processed ${studentsNeedingFollowUp.length} students for follow-ups`,
				summary: {
					studentsChecked: recentStudents.length,
					studentsNeedingFollowUp: studentsNeedingFollowUp.length,
					followUpsCreated: successful,
					failed: failed,
				},
				results,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error("Error in findAndTriggerStudentFollowUps:", error);
			return {
				success: false,
				error: "Internal error finding students for follow-ups",
				details: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			};
		}
	}
}
