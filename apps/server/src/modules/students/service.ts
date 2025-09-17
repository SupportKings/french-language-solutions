import { supabase } from "../../lib/supabase";

export class StudentService {
	async findAll(limit = 50, offset = 0) {
		const { data, error } = await supabase
			.from("students")
			.select("*")
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error("Error fetching students:", error);
			throw error;
		}

		return data || [];
	}

	async findById(id: string) {
		const { data, error } = await supabase
			.from("students")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error finding student:", error);
			return null;
		}

		return data;
	}

	async findByEmail(email: string) {
		const { data, error } = await supabase
			.from("students")
			.select("*")
			.eq("email", email)
			.single();

		if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
			console.error("Error finding student by email:", error);
		}

		return data || null;
	}

	async findByTallySubmissionId(tallyFormSubmissionId: string) {
		const { data, error } = await supabase
			.from("students")
			.select("*")
			.eq("tally_form_submission_id", tallyFormSubmissionId)
			.single();

		if (error && error.code !== "PGRST116") {
			console.error("Error finding student by Tally submission ID:", error);
		}

		return data || null;
	}

	async searchByEmail(emailQuery: string) {
		const { data, error } = await supabase
			.from("students")
			.select("*")
			.ilike("email", `%${emailQuery}%`)
			.limit(10);

		if (error) {
			console.error("Error searching students:", error);
			throw error;
		}

		return data || [];
	}

	async create(data: {
		name: string;
		email: string;
		phone?: string;
		[key: string]: any;
	}) {
		// Map to database column names
		const dbData = {
			full_name: data.name,
			email: data.email,
			mobile_phone_number: data.phone,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			// Spread other fields, they should already have correct column names
			...Object.keys(data).reduce((acc, key) => {
				if (!['name', 'email', 'phone'].includes(key)) {
					acc[key] = data[key];
				}
				return acc;
			}, {} as any)
		};

		const { data: student, error } = await supabase
			.from("students")
			.insert(dbData)
			.select()
			.single();

		if (error) {
			console.error("Error creating student:", error);
			throw error;
		}

		return student;
	}

	async update(id: string, data: any) {
		// Map common fields to database column names if needed
		const updateData = { ...data };
		if (data.name !== undefined) {
			updateData.full_name = data.name;
			delete updateData.name;
		}
		if (data.phone !== undefined) {
			updateData.mobile_phone_number = data.phone;
			delete updateData.phone;
		}
		updateData.updated_at = new Date().toISOString();

		const { data: student, error } = await supabase
			.from("students")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating student:", error);
			return null;
		}

		return student;
	}

	async delete(id: string) {
		const { data, error } = await supabase
			.from("students")
			.delete()
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error deleting student:", error);
			return null;
		}

		return data;
	}

	async upsert(email: string, data: {
		name: string;
		[key: string]: any;
	}) {
		const existing = await this.findByEmail(email);
		
		if (existing) {
			return {
				action: "updated" as const,
				student: await this.update(existing.id, data),
			};
		} else {
			return {
				action: "created" as const,
				student: await this.create({ ...data, email }),
			};
		}
	}
}