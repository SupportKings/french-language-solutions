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

interface RescheduleDeclinedEmailProps {
	studentName?: string;
	originalClassDate?: string;
	originalClassTime?: string;
	proposedDatetime?: string;
	teacherNotes?: string;
	companyName?: string;
}

export const RescheduleDeclinedEmail = ({
	studentName = "Student",
	originalClassDate = "December 15, 2024",
	originalClassTime = "10:00 AM",
	proposedDatetime = "December 17, 2024 at 2:00 PM",
	teacherNotes,
	companyName = "French Language Solutions",
}: RescheduleDeclinedEmailProps) => (
	<Html>
		<Head />
		<Body style={main}>
			<Preview>
				Your reschedule request for {originalClassDate} has been declined
			</Preview>
			<Container style={container}>
				{/* Banner */}
				<Section style={banner}>
					<Text style={bannerEmoji}>📅</Text>
					<Heading style={bannerHeading}>Request Declined</Heading>
					<Text style={bannerSubtext}>
						Your reschedule request could not be approved
					</Text>
				</Section>

				{/* Main Content */}
				<Section style={content}>
					<Text style={greeting}>Bonjour {studentName}! 👋</Text>

					<Text style={text}>
						Unfortunately, your request to reschedule your class has been{" "}
						<strong>declined</strong>. Please plan to attend the original class
						time.
					</Text>

					{/* Original Class Details */}
					<Section style={originalBox}>
						<Text style={detailsLabel}>Original Class (Please Attend)</Text>
						<Text style={originalValue}>
							{originalClassDate} at {originalClassTime}
						</Text>
					</Section>

					{/* Declined Request */}
					<Section style={declinedBox}>
						<Text style={detailsLabel}>Requested Time (Declined)</Text>
						<Text style={declinedValue}>{proposedDatetime}</Text>
					</Section>

					{/* Teacher Notes (if provided) */}
					{teacherNotes && (
						<Section style={notesBox}>
							<Text style={detailsLabel}>Teacher Notes</Text>
							<Text style={notesText}>{teacherNotes}</Text>
						</Section>
					)}

					<Text style={actionText}>
						If you have any questions or need to discuss alternative options,
						please reach out to your teacher directly.
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

RescheduleDeclinedEmail.PreviewProps = {
	studentName: "Marie",
	originalClassDate: "Friday, December 15, 2024",
	originalClassTime: "10:00 AM",
	proposedDatetime: "Tuesday, December 17, 2024 at 2:00 PM",
	teacherNotes: "Unfortunately, I have another class scheduled at that time.",
	companyName: "French Language Solutions",
} as RescheduleDeclinedEmailProps;

export default RescheduleDeclinedEmail;

// Brand colors
const primaryBlue = "#004990";
const lightBlue = "#e8f4fc";
const redLight = "#fee2e2";
const redBorder = "#ef4444";

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
	backgroundColor: "#dc2626",
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

const originalBox = {
	backgroundColor: lightBlue,
	borderRadius: "8px",
	padding: "16px 20px",
	margin: "0 0 16px",
	borderLeft: `4px solid ${primaryBlue}`,
};

const declinedBox = {
	backgroundColor: redLight,
	borderRadius: "8px",
	padding: "16px 20px",
	margin: "0 0 16px",
	borderLeft: `4px solid ${redBorder}`,
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

const originalValue = {
	color: primaryBlue,
	fontSize: "16px",
	fontWeight: "600",
	margin: "0",
};

const declinedValue = {
	color: "#991b1b",
	fontSize: "16px",
	fontWeight: "500",
	margin: "0",
	textDecoration: "line-through" as const,
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
