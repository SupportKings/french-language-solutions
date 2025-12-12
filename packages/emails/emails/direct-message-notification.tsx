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

interface DirectMessageNotificationEmailProps {
	recipientName?: string;
	senderName: string;
	messagePreview: string;
	conversationUrl?: string;
	preferencesUrl?: string;
}

export const DirectMessageNotificationEmail = ({
	recipientName = "there",
	senderName,
	messagePreview,
	conversationUrl = "https://student.frenchlanguagesolutions.com/chats",
	preferencesUrl = "https://student.frenchlanguagesolutions.com/settings",
}: DirectMessageNotificationEmailProps) => (
	<Html>
		<Head />
		<Preview>
			New message from {senderName}: {messagePreview.substring(0, 50)}
		</Preview>
		<Body style={main}>
			<Container style={container}>
				{/* Subtle Top Section */}
				<Section style={topSection}>
					<div style={iconWrapper}>
						<Text style={icon}>💬</Text>
					</div>
					<Heading style={topHeading}>New Message</Heading>
				</Section>

				{/* Main Content */}
				<Section style={content}>
					{/* Greeting */}
					<Text style={greeting}>Hi {recipientName},</Text>
					<Text style={subtext}>You have a new message from {senderName}.</Text>

					{/* Message Preview Card */}
					<Section style={messageCard}>
						<Text style={cardLabel}>From</Text>
						<Text style={cardTitle}>{senderName}</Text>
						<Text style={cardLabel}>Message</Text>
						<Text style={messageText}>"{messagePreview}"</Text>
					</Section>

					{/* Button */}
					<Section style={buttonSection}>
						<Button style={button} href={conversationUrl}>
							View Conversation
						</Button>
					</Section>

					{/* Link Fallback */}
					<Text style={linkText}>
						If the button doesn't work, copy this link:
					</Text>
					<Link href={conversationUrl} style={link}>
						{conversationUrl}
					</Link>
				</Section>

				<Hr style={divider} />

				{/* Footer */}
				<Section style={footer}>
					<Text style={footerText}>
						This message was sent via your student portal.
					</Text>
					<Text style={footerPreferences}>
						You can manage your email notification preferences{" "}
						<Link href={preferencesUrl} style={footerLink}>
							here
						</Link>
						.
					</Text>
					<Text style={footerSignoff}>À bientôt! 🇫🇷</Text>
					<Text style={footerCompany}>French Language Solutions</Text>
				</Section>
			</Container>
		</Body>
	</Html>
);

DirectMessageNotificationEmail.PreviewProps = {
	recipientName: "Marie",
	senderName: "Jean-Paul Dubois",
	messagePreview: "Hi Marie, I wanted to follow up on our last class...",
	conversationUrl: "https://student.frenchlanguagesolutions.com/chats/123",
	preferencesUrl: "https://student.frenchlanguagesolutions.com/settings",
} as DirectMessageNotificationEmailProps;

export default DirectMessageNotificationEmail;

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

// Clean card for message preview
const messageCard = {
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
	margin: "0 0 16px",
};

const messageText = {
	color: "#374151",
	fontSize: "14px",
	lineHeight: "22px",
	margin: "0",
	fontStyle: "italic" as const,
	borderLeft: `3px solid ${primaryBlue}`,
	paddingLeft: "12px",
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
	margin: "0 0 8px",
};

const footerPreferences = {
	color: "#6b7280",
	fontSize: "13px",
	lineHeight: "20px",
	margin: "0 0 12px",
};

const footerLink = {
	color: primaryBlue,
	textDecoration: "none",
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
