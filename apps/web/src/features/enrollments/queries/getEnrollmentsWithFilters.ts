"use server";

import { createClient } from "@/utils/supabase/server";

export async function getEnrollmentsWithFilters(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	search = "",
) {
	try {
		const supabase = await createClient();

		// Determine if we need inner join for cohorts
		// Use inner join when filtering by product, cohort nickname, or any cohort-related field
		const productFilter = filters.find((f) => f.columnId === "productId");
		const cohortNicknameFilter = filters.find(
			(f) => f.columnId === "cohortNickname",
		);
		const cohortFormatFilter = filters.find(
			(f) => f.columnId === "cohort_format",
		);
		const cohortStatusFilter = filters.find(
			(f) => f.columnId === "cohort_status",
		);
		const startingLevelFilter = filters.find(
			(f) => f.columnId === "starting_level",
		);
		const roomTypeFilter = filters.find((f) => f.columnId === "room_type");
		const teacherIdFilter = filters.find((f) => f.columnId === "teacherId");

		const needsCohortInnerJoin =
			(productFilter?.values?.length > 0) ||
			(cohortNicknameFilter?.values?.length > 0) ||
			(cohortFormatFilter?.values?.length > 0) ||
			(cohortStatusFilter?.values?.length > 0) ||
			(startingLevelFilter?.values?.length > 0) ||
			(roomTypeFilter?.values?.length > 0) ||
			(teacherIdFilter?.values?.length > 0);

		const cohortJoin = needsCohortInnerJoin ? "cohorts!inner" : "cohorts";

		let query = supabase.from("enrollments").select(
			`
				*,
				students!inner(id, full_name, email),
				${cohortJoin}(
					id,
					nickname,
					starting_level_id,
					current_level_id,
					start_date,
					room_type,
					product_id,
					cohort_status,
					max_students,
					products (
						id,
						format,
						display_name
					),
					starting_level:language_levels!starting_level_id (
						id,
						code,
						display_name
					),
					current_level:language_levels!current_level_id (
						id,
						code,
						display_name
					),
					weekly_sessions (
						id,
						day_of_week,
						start_time,
						end_time,
						teacher_id,
						teachers (
							id,
							first_name,
							last_name
						)
					)
				)
			`,
			{ count: "exact" },
		);

		// Apply search filter (student name or email)
		if (search) {
			const s = search.replace(/,/g, "\\,");
			query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`, {
				foreignTable: "students",
			});
		}

		// Apply filters with proper operator support
		filters.forEach((filter) => {
			if (!filter.values || filter.values.length === 0) return;

			const values = filter.values;
			const operator = filter.operator || "is any of";
			const columnId = filter.columnId;

			// Apply filter based on column type and operator
			switch (columnId) {
				case "status":
					// Enrollment status - option filter
					if (operator === "is" || operator === "is any of") {
						query = query.in("status", values);
					} else if (operator === "is not" || operator === "is none of") {
						query = query.not("status", "in", `(${values.join(",")})`);
					}
					break;

				case "productId":
					// Product filter - option filter
					if (operator === "is" || operator === "is any of") {
						query = query.in("cohorts.product_id", values);
					} else if (operator === "is not" || operator === "is none of") {
						query = query.not(
							"cohorts.product_id",
							"in",
							`(${values.join(",")})`,
						);
					}
					break;

				case "cohortNickname":
					// Cohort nickname - text filter
					// Always exclude cohorts without a nickname when filtering by nickname
					query = query.not("cohorts.nickname", "is", null);
					if (operator === "contains") {
						query = query.ilike("cohorts.nickname", `%${values[0]}%`);
					} else if (operator === "does not contain") {
						query = query.not("cohorts.nickname", "ilike", `%${values[0]}%`);
					}
					break;

				case "teacherId":
					// Teacher filter - complex (handled via weekly_sessions)
					// NOTE: This is a limitation - PostgREST doesn't easily support filtering on nested arrays
					// We'll need to handle this differently - see note below
					// For now, we'll skip this at DB level and handle in a separate query
					break;

				case "cohort_format":
					// Cohort format - option filter
					if (operator === "is" || operator === "is any of") {
						query = query.in("cohorts.products.format", values);
					} else if (operator === "is not" || operator === "is none of") {
						query = query.not(
							"cohorts.products.format",
							"in",
							`(${values.join(",")})`,
						);
					}
					break;

				case "cohort_status":
					// Cohort status - option filter
					if (operator === "is" || operator === "is any of") {
						query = query.in("cohorts.cohort_status", values);
					} else if (operator === "is not" || operator === "is none of") {
						query = query.not(
							"cohorts.cohort_status",
							"in",
							`(${values.join(",")})`,
						);
					}
					break;

				case "starting_level":
					// Starting level - option filter
					if (operator === "is" || operator === "is any of") {
						query = query.in("cohorts.starting_level.code", values);
					} else if (operator === "is not" || operator === "is none of") {
						query = query.not(
							"cohorts.starting_level.code",
							"in",
							`(${values.join(",")})`,
						);
					}
					break;

				case "room_type":
					// Room type - option filter
					if (operator === "is" || operator === "is any of") {
						query = query.in("cohorts.room_type", values);
					} else if (operator === "is not" || operator === "is none of") {
						query = query.not(
							"cohorts.room_type",
							"in",
							`(${values.join(",")})`,
						);
					}
					break;

				case "created_at":
					// Date filter
					const fromDate = values[0];
					const toDate = values[1];

					if (operator === "is") {
						query = query.eq("created_at", fromDate);
					} else if (operator === "is not") {
						query = query.neq("created_at", fromDate);
					} else if (operator === "is before") {
						query = query.lt("created_at", fromDate);
					} else if (operator === "is on or after") {
						query = query.gte("created_at", fromDate);
					} else if (operator === "is after") {
						query = query.gt("created_at", fromDate);
					} else if (operator === "is on or before") {
						query = query.lte("created_at", fromDate);
					} else if (operator === "is between") {
						if (fromDate && toDate) {
							query = query.gte("created_at", fromDate).lte("created_at", toDate);
						}
					} else if (operator === "is not between") {
						if (fromDate && toDate) {
							query = query.or(
								`created_at.lt.${fromDate},created_at.gt.${toDate}`,
							);
						}
					}
					break;

				case "completion_percentage":
					// Completion percentage - number filter
					const min = values[0];
					const max = values[1];

					if (operator === "is") {
						query = query.eq("completion_percentage", Number.parseFloat(min));
					} else if (operator === "is not") {
						query = query.neq("completion_percentage", Number.parseFloat(min));
					} else if (operator === "is greater than") {
						query = query.gt("completion_percentage", Number.parseFloat(min));
					} else if (operator === "is greater than or equal to") {
						query = query.gte("completion_percentage", Number.parseFloat(min));
					} else if (operator === "is less than") {
						query = query.lt("completion_percentage", Number.parseFloat(min));
					} else if (operator === "is less than or equal to") {
						query = query.lte("completion_percentage", Number.parseFloat(min));
					} else if (operator === "is between") {
						if (min !== null && max !== null) {
							query = query
								.gte("completion_percentage", Number.parseFloat(min))
								.lte("completion_percentage", Number.parseFloat(max));
						}
					} else if (operator === "is not between") {
						if (min !== null && max !== null) {
							query = query.or(
								`completion_percentage.lt.${Number.parseFloat(min)},completion_percentage.gt.${Number.parseFloat(max)}`,
							);
						}
					}
					break;

				case "student_id":
					// Direct student ID filter
					query = query.eq("student_id", values[0]);
					break;

				case "cohort_id":
					// Direct cohort ID filter
					query = query.eq("cohort_id", values[0]);
					break;
			}
		});

		// Handle teacher filter separately if present
		// We need to fetch cohorts with matching teachers first, then filter enrollments
		const teacherFilter = filters.find((f) => f.columnId === "teacherId");
		if (teacherFilter?.values?.length > 0) {
			const teacherIds = teacherFilter.values;
			const teacherOperator = teacherFilter.operator || "is any of";

			// Query cohorts with matching teachers
			const cohortQuery = supabase
				.from("cohorts")
				.select("id, weekly_sessions(teacher_id)");

			const { data: cohortsData } = await cohortQuery;

			if (cohortsData) {
				// Filter cohorts based on teacher presence
				const matchingCohortIds = cohortsData
					.filter((cohort: any) => {
						const sessions = cohort.weekly_sessions || [];
						const cohortTeacherIds = sessions
							.map((s: any) => s.teacher_id)
							.filter(Boolean);

						const hasMatch = cohortTeacherIds.some((id: string) =>
							teacherIds.includes(id),
						);

						if (teacherOperator === "is" || teacherOperator === "is any of") {
							return hasMatch;
						} else if (
							teacherOperator === "is not" ||
							teacherOperator === "is none of"
						) {
							return !hasMatch;
						}
						return hasMatch;
					})
					.map((c: any) => c.id);

				// Apply cohort filter to enrollments
				if (matchingCohortIds.length > 0) {
					query = query.in("cohort_id", matchingCohortIds);
				} else {
					// No matching cohorts, return empty result
					return { data: [], count: 0 };
				}
			}
		}

		// Apply sorting
		if (sorting.length > 0) {
			const sort = sorting[0];
			const sortColumn =
				sort.id === "student_name" ? "students.full_name" : sort.id;
			query = query.order(sortColumn, { ascending: !sort.desc });
		} else {
			// Default sorting by created_at descending
			query = query.order("created_at", { ascending: false });
		}

		// Apply pagination
		const from = page * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching enrollments with filters:", error);
			return { data: [], count: 0 };
		}

		return { data: data || [], count: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getEnrollmentsWithFilters:", error);
		return { data: [], count: 0 };
	}
}

// Combined query for enrollments with faceted data - optimized single call
export async function getEnrollmentsWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	search = "",
	facetedColumns: string[] = [],
) {
	try {
		// Get main enrollments data
		const enrollmentsResult = await getEnrollmentsWithFilters(
			filters,
			page,
			pageSize,
			sorting,
			search,
		);

		// Get faceted data for each requested column
		const facetedData: Record<string, Map<string, number>> = {};

		// Fetch faceted counts for each column in parallel
		await Promise.all(
			facetedColumns.map(async (columnId) => {
				const facetMap = await getEnrollmentsFaceted(columnId, filters, search);
				facetedData[columnId] = facetMap;
			}),
		);

		return {
			enrollments: enrollmentsResult.data,
			totalCount: enrollmentsResult.count,
			facetedData,
		};
	} catch (error) {
		console.error("Unexpected error in getEnrollmentsWithFaceted:", error);
		return {
			enrollments: [],
			totalCount: 0,
			facetedData: {},
		};
	}
}

export async function getEnrollmentsFaceted(
	columnId: string,
	filters: any[] = [],
	search = "",
) {
	try {
		const supabase = await createClient();

		// Determine if we need inner join for cohorts based on filters
		const cohortRelatedFilters = [
			"productId",
			"cohortNickname",
			"cohort_format",
			"cohort_status",
			"starting_level",
			"room_type",
			"teacherId",
		];

		const hasCohortFilter = filters.some(
			(f) =>
				cohortRelatedFilters.includes(f.columnId) && f.values?.length > 0,
		);

		// Also need inner join if faceting on cohort-related column
		const isCohortColumn = cohortRelatedFilters.includes(columnId);
		const needsCohortInnerJoin = hasCohortFilter || isCohortColumn;

		// Build appropriate select based on column being faceted and search
		let selectClause = "*";
		if (columnId === "status") {
			// For status, still need cohort join if filtering by cohort fields
			if (needsCohortInnerJoin) {
				selectClause = "status, cohorts!inner(id)";
			} else {
				selectClause = "status";
			}
		} else if (columnId === "productId") {
			selectClause = `cohorts!inner(product_id)`;
		} else if (columnId === "cohort_format") {
			selectClause = `cohorts!inner(products(format))`;
		} else if (columnId === "cohort_status") {
			selectClause = `cohorts!inner(cohort_status)`;
		} else if (columnId === "starting_level") {
			selectClause = `cohorts!inner(starting_level:language_levels!starting_level_id(code))`;
		} else if (columnId === "room_type") {
			selectClause = `cohorts!inner(room_type)`;
		}

		// Include students in select if search is present
		if (search) {
			selectClause = `${selectClause}, students!inner(full_name, email)`;
		}

		let query = supabase
			.from("enrollments")
			.select(selectClause, { count: "exact" });

		// Apply search filter
		if (search) {
			const s = search.replace(/,/g, "\\,");
			query = query.or(`students.full_name.ilike.%${s}%,students.email.ilike.%${s}%`);
		}

		// Apply existing filters (excluding the column we're faceting)
		filters
			.filter((filter) => filter.columnId !== columnId)
			.forEach((filter) => {
				if (!filter.values || filter.values.length === 0) return;

				const values = filter.values;
				const operator = filter.operator || "is any of";
				const filterColumnId = filter.columnId;

				// Apply same operator logic as main query
				switch (filterColumnId) {
					case "status":
						if (operator === "is" || operator === "is any of") {
							query = query.in("status", values);
						} else if (operator === "is not" || operator === "is none of") {
							query = query.not("status", "in", `(${values.join(",")})`);
						}
						break;

					case "productId":
						if (operator === "is" || operator === "is any of") {
							query = query.in("cohorts.product_id", values);
						} else if (operator === "is not" || operator === "is none of") {
							query = query.not(
								"cohorts.product_id",
								"in",
								`(${values.join(",")})`,
							);
						}
						break;

					case "cohortNickname":
						// Always exclude cohorts without a nickname when filtering by nickname
						query = query.not("cohorts.nickname", "is", null);
						if (operator === "contains") {
							query = query.ilike("cohorts.nickname", `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not("cohorts.nickname", "ilike", `%${values[0]}%`);
						}
						break;

					case "cohort_format":
						if (operator === "is" || operator === "is any of") {
							query = query.in("cohorts.products.format", values);
						} else if (operator === "is not" || operator === "is none of") {
							query = query.not(
								"cohorts.products.format",
								"in",
								`(${values.join(",")})`,
							);
						}
						break;

					case "cohort_status":
						if (operator === "is" || operator === "is any of") {
							query = query.in("cohorts.cohort_status", values);
						} else if (operator === "is not" || operator === "is none of") {
							query = query.not(
								"cohorts.cohort_status",
								"in",
								`(${values.join(",")})`,
							);
						}
						break;

					case "starting_level":
						if (operator === "is" || operator === "is any of") {
							query = query.in("cohorts.starting_level.code", values);
						} else if (operator === "is not" || operator === "is none of") {
							query = query.not(
								"cohorts.starting_level.code",
								"in",
								`(${values.join(",")})`,
							);
						}
						break;

					case "room_type":
						if (operator === "is" || operator === "is any of") {
							query = query.in("cohorts.room_type", values);
						} else if (operator === "is not" || operator === "is none of") {
							query = query.not(
								"cohorts.room_type",
								"in",
								`(${values.join(",")})`,
							);
						}
						break;

					case "created_at":
						const fromDate = values[0];
						const toDate = values[1];

						if (operator === "is") {
							query = query.eq("created_at", fromDate);
						} else if (operator === "is not") {
							query = query.neq("created_at", fromDate);
						} else if (operator === "is before") {
							query = query.lt("created_at", fromDate);
						} else if (operator === "is on or after") {
							query = query.gte("created_at", fromDate);
						} else if (operator === "is after") {
							query = query.gt("created_at", fromDate);
						} else if (operator === "is on or before") {
							query = query.lte("created_at", fromDate);
						} else if (operator === "is between") {
							if (fromDate && toDate) {
								query = query
									.gte("created_at", fromDate)
									.lte("created_at", toDate);
							}
						} else if (operator === "is not between") {
							if (fromDate && toDate) {
								query = query.or(
									`created_at.lt.${fromDate},created_at.gt.${toDate}`,
								);
							}
						}
						break;

					case "completion_percentage":
						const min = values[0];
						const max = values[1];

						if (operator === "is") {
							query = query.eq(
								"completion_percentage",
								Number.parseFloat(min),
							);
						} else if (operator === "is not") {
							query = query.neq(
								"completion_percentage",
								Number.parseFloat(min),
							);
						} else if (operator === "is greater than") {
							query = query.gt("completion_percentage", Number.parseFloat(min));
						} else if (operator === "is greater than or equal to") {
							query = query.gte(
								"completion_percentage",
								Number.parseFloat(min),
							);
						} else if (operator === "is less than") {
							query = query.lt("completion_percentage", Number.parseFloat(min));
						} else if (operator === "is less than or equal to") {
							query = query.lte(
								"completion_percentage",
								Number.parseFloat(min),
							);
						} else if (operator === "is between") {
							if (min !== null && max !== null) {
								query = query
									.gte("completion_percentage", Number.parseFloat(min))
									.lte("completion_percentage", Number.parseFloat(max));
							}
						} else if (operator === "is not between") {
							if (min !== null && max !== null) {
								query = query.or(
									`completion_percentage.lt.${Number.parseFloat(min)},completion_percentage.gt.${Number.parseFloat(max)}`,
								);
							}
						}
						break;

					case "student_id":
						query = query.eq("student_id", values[0]);
						break;

					case "cohort_id":
						query = query.eq("cohort_id", values[0]);
						break;
				}
			});

		// Handle teacher filter for faceting
		const teacherFilter = filters.find((f) => f.columnId === "teacherId");
		if (teacherFilter?.values?.length > 0 && columnId !== "teacherId") {
			const teacherIds = teacherFilter.values;
			const teacherOperator = teacherFilter.operator || "is any of";

			const cohortQuery = supabase
				.from("cohorts")
				.select("id, weekly_sessions(teacher_id)");

			const { data: cohortsData } = await cohortQuery;

			if (cohortsData) {
				const matchingCohortIds = cohortsData
					.filter((cohort: any) => {
						const sessions = cohort.weekly_sessions || [];
						const cohortTeacherIds = sessions
							.map((s: any) => s.teacher_id)
							.filter(Boolean);

						const hasMatch = cohortTeacherIds.some((id: string) =>
							teacherIds.includes(id),
						);

						if (teacherOperator === "is" || teacherOperator === "is any of") {
							return hasMatch;
						} else if (
							teacherOperator === "is not" ||
							teacherOperator === "is none of"
						) {
							return !hasMatch;
						}
						return hasMatch;
					})
					.map((c: any) => c.id);

				if (matchingCohortIds.length > 0) {
					query = query.in("cohort_id", matchingCohortIds);
				} else {
					return new Map<string, number>();
				}
			}
		}

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching faceted data:", error);
			return new Map<string, number>();
		}

		// Convert to Map format
		const facetedMap = new Map<string, number>();
		data?.forEach((item: any) => {
			let value: string | null = null;

			// Extract value based on column
			if (columnId === "status") {
				value = item.status;
			} else if (columnId === "productId" && item.cohorts) {
				value = item.cohorts.product_id;
			} else if (columnId === "cohort_format" && item.cohorts?.products) {
				value = item.cohorts.products.format;
			} else if (columnId === "cohort_status" && item.cohorts) {
				value = item.cohorts.cohort_status;
			} else if (columnId === "starting_level" && item.cohorts?.starting_level) {
				value = item.cohorts.starting_level.code;
			} else if (columnId === "room_type" && item.cohorts) {
				value = item.cohorts.room_type;
			}

			if (value) {
				const key = String(value);
				facetedMap.set(key, (facetedMap.get(key) || 0) + 1);
			}
		});

		return facetedMap;
	} catch (error) {
		console.error("Unexpected error in getEnrollmentsFaceted:", error);
		return new Map<string, number>();
	}
}
