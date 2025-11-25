import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface AnnouncementNotificationEmailProps {
	studentName?: string;
	announcementTitle: string;
	viewUrl?: string;
}

export const AnnouncementNotificationEmail = ({
	studentName = "there",
	announcementTitle,
	viewUrl = "https://student.frenchlanguagesolutions.com",
}: AnnouncementNotificationEmailProps) => (
	<Html>
		<Head />
		<Preview>New announcement: {announcementTitle}</Preview>
		<Body style={main}>
			<Container style={container}>
				{/* Subtle Top Section */}
				<Section style={topSection}>
					<div style={iconWrapper}>
						<Text style={icon}>📢</Text>
					</div>
					<Heading style={topHeading}>New Announcement</Heading>
				</Section>

				{/* Main Content */}
				<Section style={content}>
					{/* Greeting */}
					<Text style={greeting}>Hi {studentName},</Text>
					<Text style={subtext}>You have a new announcement.</Text>

					{/* Announcement Preview Card */}
					<Section style={announcementCard}>
						<Text style={cardLabel}>Subject</Text>
						<Text style={cardTitle}>{announcementTitle}</Text>
						<Text style={cardHint}>
							Click below to read the full announcement.
						</Text>
					</Section>

					{/* Button */}
					<Section style={buttonSection}>
						<Button style={button} href={viewUrl}>
							View Announcement
						</Button>
					</Section>

					{/* Link Fallback */}
					<Text style={linkText}>
						If the button doesn't work, copy this link:
					</Text>
					<Link href={viewUrl} style={link}>
						{viewUrl}
					</Link>
				</Section>

				<Hr style={divider} />

				{/* Footer */}
				<Section style={footer}>
					<Text style={footerText}>
						This announcement was posted to your student portal.
					</Text>
					<Text style={footerSignoff}>À bientôt! 🇫🇷</Text>
					<Text style={footerCompany}>French Language Solutions</Text>
				</Section>
			</Container>
		</Body>
	</Html>
);

AnnouncementNotificationEmail.PreviewProps = {
	studentName: "Marie",
	announcementTitle: "Class Schedule Update for December",
	viewUrl: "https://student.frenchlanguagesolutions.com/announcements",
} as AnnouncementNotificationEmailProps;

export default AnnouncementNotificationEmail;

// Brand colors
const primaryBlue = "#004990";
const secondaryRed = "#f80003";

const main = {
	backgroundColor: "#F7F9FC",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
	padding: "40px 20px",
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	maxWidth: "560px",
	borderRadius: "12px",
	overflow: "hidden" as const,
	boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
};

// Soft top section (not dark banner)
const topSection = {
	backgroundColor: "#F7F9FC",
	padding: "32px 40px 24px",
	textAlign: "left" as const,
};

const iconWrapper = {
	marginBottom: "8px",
};

const icon = {
	fontSize: "28px",
	margin: "0",
	lineHeight: "1",
	display: "inline-block",
};

const topHeading = {
	color: "#1f2937",
	fontSize: "20px",
	fontWeight: "600",
	margin: "0",
	letterSpacing: "-0.3px",
};

const content = {
	padding: "32px 40px",
};

const greeting = {
	color: "#1f2937",
	fontSize: "16px",
	fontWeight: "500",
	margin: "0 0 4px",
	lineHeight: "24px",
};

const subtext = {
	color: "#6b7280",
	fontSize: "15px",
	lineHeight: "24px",
	margin: "0 0 24px",
};

// Clean card for announcement preview
const announcementCard = {
	backgroundColor: "#F9FAFB",
	border: "1px solid #E3E8EF",
	borderRadius: "8px",
	padding: "20px",
	margin: "0 0 28px",
};

const cardLabel = {
	color: "#6b7280",
	fontSize: "12px",
	fontWeight: "500",
	textTransform: "uppercase" as const,
	letterSpacing: "0.5px",
	margin: "0 0 8px",
};

const cardTitle = {
	color: "#1f2937",
	fontSize: "16px",
	fontWeight: "600",
	lineHeight: "24px",
	margin: "0 0 8px",
};

const cardHint = {
	color: "#9ca3af",
	fontSize: "13px",
	lineHeight: "20px",
	margin: "0",
};

const buttonSection = {
	textAlign: "center" as const,
	margin: "0 0 24px",
};

const button = {
	backgroundColor: primaryBlue,
	borderRadius: "8px",
	color: "#ffffff",
	fontSize: "15px",
	fontWeight: "600",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "inline-block",
	padding: "12px 28px",
	boxShadow: "0 1px 3px rgba(0, 73, 144, 0.15)",
	transition: "all 0.2s ease",
};

const linkText = {
	color: "#6b7280",
	fontSize: "12px",
	textAlign: "center" as const,
	margin: "0 0 8px",
	lineHeight: "18px",
};

const link = {
	color: primaryBlue,
	fontSize: "12px",
	textDecoration: "none",
	wordBreak: "break-all" as const,
	display: "block",
	textAlign: "center" as const,
};

const divider = {
	borderColor: "#e5e7eb",
	margin: "0",
};

const footer = {
	padding: "28px 40px",
	backgroundColor: "#F9FAFB",
	textAlign: "center" as const,
};

const footerText = {
	color: "#6b7280",
	fontSize: "13px",
	lineHeight: "20px",
	margin: "0 0 12px",
};

const footerSignoff = {
	color: primaryBlue,
	fontSize: "14px",
	fontWeight: "500",
	margin: "0 0 4px",
};

const footerCompany = {
	color: "#9ca3af",
	fontSize: "12px",
	margin: "0",
};
