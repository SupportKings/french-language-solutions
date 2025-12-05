import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface RescheduleApprovedEmailProps {
	studentName?: string;
	originalClassDate?: string;
	originalClassTime?: string;
	proposedDatetime?: string;
	teacherNotes?: string;
	companyName?: string;
}

export const RescheduleApprovedEmail = ({
	studentName = "Student",
	originalClassDate = "December 15, 2024",
	originalClassTime = "10:00 AM",
	proposedDatetime = "December 17, 2024 at 2:00 PM",
	teacherNotes,
	companyName = "French Language Solutions",
}: RescheduleApprovedEmailProps) => (
	<Html>
		<Head />
		<Body style={main}>
			<Preview>
				Your reschedule request for {originalClassDate} has been approved
			</Preview>
			<Container style={container}>
				{/* Banner */}
				<Section style={banner}>
					<Text style={bannerEmoji}>✅</Text>
					<Heading style={bannerHeading}>Request Approved</Heading>
					<Text style={bannerSubtext}>
						Your reschedule request has been approved
					</Text>
				</Section>

				{/* Main Content */}
				<Section style={content}>
					<Text style={greeting}>Bonjour {studentName}! 👋</Text>

					<Text style={text}>
						Great news! Your request to reschedule your class has been{" "}
						<strong>approved</strong>.
					</Text>

					{/* Original Class Details */}
					<Section style={detailsBox}>
						<Text style={detailsLabel}>Original Class</Text>
						<Text style={detailsValue}>
							{originalClassDate} at {originalClassTime}
						</Text>
					</Section>

					{/* Approved New Time */}
					<Section style={approvedBox}>
						<Text style={detailsLabel}>Approved New Time</Text>
						<Text style={approvedValue}>{proposedDatetime}</Text>
					</Section>

					{/* Teacher Notes (if provided) */}
					{teacherNotes && (
						<Section style={notesBox}>
							<Text style={detailsLabel}>Teacher Notes</Text>
							<Text style={notesText}>{teacherNotes}</Text>
						</Section>
					)}

					<Text style={actionText}>
						Please make sure to update your calendar accordingly. If you have
						any questions, feel free to reach out to your teacher.
					</Text>
				</Section>

				<Hr style={divider} />

				{/* Footer */}
				<Section style={footer}>
					<Text style={footerText}>
						This is an automated notification from the {companyName} portal.
					</Text>
					<Text style={footerCompany}>{companyName}</Text>
				</Section>
			</Container>
		</Body>
	</Html>
);

RescheduleApprovedEmail.PreviewProps = {
	studentName: "Marie",
	originalClassDate: "Friday, December 15, 2024",
	originalClassTime: "10:00 AM",
	proposedDatetime: "Tuesday, December 17, 2024 at 2:00 PM",
	teacherNotes: "See you at the new time!",
	companyName: "French Language Solutions",
} as RescheduleApprovedEmailProps;

export default RescheduleApprovedEmail;

// Brand colors
const primaryBlue = "#004990";
const lightBlue = "#e8f4fc";
const emeraldLight = "#d1fae5";
const emeraldBorder = "#10b981";

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		"'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "0",
	maxWidth: "600px",
	borderRadius: "12px",
	overflow: "hidden" as const,
	boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
};

const banner = {
	backgroundColor: "#059669",
	padding: "32px 40px",
	textAlign: "center" as const,
};

const bannerEmoji = {
	fontSize: "48px",
	margin: "0 0 8px",
	lineHeight: "1",
};

const bannerHeading = {
	color: "#ffffff",
	fontSize: "28px",
	fontWeight: "700",
	margin: "0 0 8px",
	letterSpacing: "-0.5px",
};

const bannerSubtext = {
	color: "rgba(255, 255, 255, 0.9)",
	fontSize: "16px",
	margin: "0",
};

const content = {
	padding: "40px",
};

const greeting = {
	color: primaryBlue,
	fontSize: "22px",
	fontWeight: "600",
	margin: "0 0 24px",
};

const text = {
	color: "#374151",
	fontSize: "16px",
	lineHeight: "26px",
	margin: "0 0 24px",
};

const detailsBox = {
	backgroundColor: lightBlue,
	borderRadius: "8px",
	padding: "16px 20px",
	margin: "0 0 16px",
};

const approvedBox = {
	backgroundColor: emeraldLight,
	borderRadius: "8px",
	padding: "16px 20px",
	margin: "0 0 16px",
	borderLeft: `4px solid ${emeraldBorder}`,
};

const notesBox = {
	backgroundColor: "#f9fafb",
	borderRadius: "8px",
	padding: "16px 20px",
	margin: "0 0 24px",
	borderLeft: "4px solid #e5e7eb",
};

const detailsLabel = {
	color: "#6b7280",
	fontSize: "12px",
	fontWeight: "600",
	textTransform: "uppercase" as const,
	letterSpacing: "0.5px",
	margin: "0 0 4px",
};

const detailsValue = {
	color: "#1f2937",
	fontSize: "16px",
	fontWeight: "500",
	margin: "0",
};

const approvedValue = {
	color: "#065f46",
	fontSize: "16px",
	fontWeight: "600",
	margin: "0",
};

const notesText = {
	color: "#4b5563",
	fontSize: "15px",
	lineHeight: "24px",
	margin: "0",
	fontStyle: "italic" as const,
};

const actionText = {
	color: "#6b7280",
	fontSize: "14px",
	lineHeight: "22px",
	margin: "0",
};

const divider = {
	borderColor: "#e5e7eb",
	margin: "0",
};

const footer = {
	padding: "32px 40px",
	backgroundColor: "#f9fafb",
};

const footerText = {
	color: "#6b7280",
	fontSize: "14px",
	lineHeight: "22px",
	margin: "0 0 8px",
	textAlign: "center" as const,
};

const footerCompany = {
	color: "#9ca3af",
	fontSize: "13px",
	margin: "0",
	textAlign: "center" as const,
};
