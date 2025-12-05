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

interface RescheduleRequestEmailProps {
	studentName?: string;
	teacherName?: string;
	cohortName?: string;
	originalClassDate?: string;
	originalClassTime?: string;
	proposedDatetime?: string;
	reason?: string;
	companyName?: string;
}

export const RescheduleRequestEmail = ({
	studentName = "A student",
	teacherName = "there",
	cohortName = "French Class",
	originalClassDate = "December 15, 2024",
	originalClassTime = "10:00 AM",
	proposedDatetime = "December 17, 2024 at 2:00 PM",
	reason,
	companyName = "French Language Solutions",
}: RescheduleRequestEmailProps) => (
	<Html>
		<Head />
		<Body style={main}>
			<Preview>
				New reschedule request from {studentName} for {originalClassDate}
			</Preview>
			<Container style={container}>
				{/* Banner */}
				<Section style={banner}>
					<Text style={bannerEmoji}>📅</Text>
					<Heading style={bannerHeading}>Reschedule Request</Heading>
					<Text style={bannerSubtext}>
						A student has requested to reschedule a class
					</Text>
				</Section>

				{/* Main Content */}
				<Section style={content}>
					<Text style={greeting}>Bonjour {teacherName}! 👋</Text>

					<Text style={text}>
						<strong>{studentName}</strong> has submitted a request to reschedule
						their upcoming class.
					</Text>

					{/* Original Class Details */}
					<Section style={detailsBox}>
						<Text style={detailsLabel}>Original Class</Text>
						<Text style={detailsValue}>
							{originalClassDate} at {originalClassTime}
						</Text>
					</Section>

					{/* Proposed Time */}
					<Section style={proposedBox}>
						<Text style={detailsLabel}>Proposed New Time</Text>
						<Text style={proposedValue}>{proposedDatetime}</Text>
					</Section>

					{/* Reason (if provided) */}
					{reason && (
						<Section style={reasonBox}>
							<Text style={detailsLabel}>Reason</Text>
							<Text style={reasonText}>{reason}</Text>
						</Section>
					)}

					<Text style={actionText}>
						Please review this request and respond to the student at your
						earliest convenience. You can approve or reject this request through
						the admin dashboard.
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

RescheduleRequestEmail.PreviewProps = {
	studentName: "Marie Dupont",
	teacherName: "Sophie",
	cohortName: "Private French A2",
	originalClassDate: "Friday, December 15, 2024",
	originalClassTime: "10:00 AM",
	proposedDatetime: "Tuesday, December 17, 2024 at 2:00 PM",
	reason: "I have a doctor's appointment during the original time slot.",
	companyName: "French Language Solutions",
} as RescheduleRequestEmailProps;

export default RescheduleRequestEmail;

// Brand colors
const primaryBlue = "#004990";
const lightBlue = "#e8f4fc";
const amberLight = "#fef3c7";
const amberBorder = "#fbbf24";

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
	backgroundColor: primaryBlue,
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

const proposedBox = {
	backgroundColor: amberLight,
	borderRadius: "8px",
	padding: "16px 20px",
	margin: "0 0 16px",
	borderLeft: `4px solid ${amberBorder}`,
};

const reasonBox = {
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

const proposedValue = {
	color: "#92400e",
	fontSize: "16px",
	fontWeight: "600",
	margin: "0",
};

const reasonText = {
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
