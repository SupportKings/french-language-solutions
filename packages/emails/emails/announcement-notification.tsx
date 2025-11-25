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
		<Body style={main}>
			<Preview>New announcement: {announcementTitle}</Preview>
			<Container style={container}>
				{/* Notification Banner */}
				<Section style={banner}>
					<Text style={bannerEmoji}>📢</Text>
					<Heading style={bannerHeading}>New Announcement</Heading>
				</Section>

				{/* Main Content */}
				<Section style={content}>
					<Text style={greeting}>Hi {studentName}! 👋</Text>

					<Text style={text}>You have a new announcement:</Text>

					<Section style={announcementBox}>
						<Text style={announcementTitle}>"{announcementTitle}"</Text>
					</Section>

					<Section style={buttonSection}>
						<Button style={button} href={viewUrl}>
							View Announcement
						</Button>
					</Section>

					<Text style={linkText}>Or copy this link into your browser:</Text>
					<Text style={urlText}>
						<Link href={viewUrl} style={link}>
							{viewUrl}
						</Link>
					</Text>
				</Section>

				<Hr style={divider} />

				{/* Footer */}
				<Section style={footer}>
					<Text style={footerText}>
						This announcement was posted to your student portal.
					</Text>
					<Text style={footerNote}>À bientôt! 🇫🇷</Text>
					<Text style={footerCompany}>French Language Solutions</Text>
				</Section>
			</Container>
		</Body>
	</Html>
);

AnnouncementNotificationEmail.PreviewProps = {
	studentName: "Marie",
	announcementTitle: "Important: Class Schedule Update for December",
	viewUrl: "https://student.frenchlanguagesolutions.com/announcements",
} as AnnouncementNotificationEmailProps;

export default AnnouncementNotificationEmail;

// Brand colors
const primaryBlue = "#004990";
const secondaryRed = "#f80003";
const lightBlue = "#e8f4fc";

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
	fontSize: "32px",
	fontWeight: "700",
	margin: "0",
	letterSpacing: "-0.5px",
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
	margin: "0 0 16px",
};

const announcementBox = {
	backgroundColor: lightBlue,
	borderLeft: `4px solid ${primaryBlue}`,
	borderRadius: "8px",
	padding: "20px 24px",
	margin: "24px 0",
};

const announcementTitle = {
	color: "#1f2937",
	fontSize: "18px",
	fontWeight: "600",
	lineHeight: "28px",
	margin: "0",
};

const buttonSection = {
	textAlign: "center" as const,
	margin: "32px 0",
};

const button = {
	backgroundColor: secondaryRed,
	borderRadius: "8px",
	color: "#ffffff",
	fontSize: "16px",
	fontWeight: "600",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "inline-block",
	padding: "14px 32px",
	boxShadow: "0 2px 4px rgba(248, 0, 3, 0.2)",
};

const linkText = {
	color: "#6b7280",
	fontSize: "13px",
	textAlign: "center" as const,
	margin: "0 0 8px",
};

const urlText = {
	textAlign: "center" as const,
	margin: "0",
};

const link = {
	color: primaryBlue,
	fontSize: "13px",
	textDecoration: "underline",
	wordBreak: "break-all" as const,
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
	margin: "0 0 16px",
	textAlign: "center" as const,
};

const footerNote = {
	color: primaryBlue,
	fontSize: "16px",
	fontWeight: "500",
	margin: "0 0 8px",
	textAlign: "center" as const,
};

const footerCompany = {
	color: "#9ca3af",
	fontSize: "13px",
	margin: "0",
	textAlign: "center" as const,
};
