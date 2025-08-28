import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface InviteEmailProps {
	inviteUrl?: string;
	companyName?: string;
	inviterName?: string;
	inviterEmail?: string;
	role?: string;
}

export const InviteEmail = ({
	inviteUrl,
	companyName,
	inviterName,
	inviterEmail,
	role,
}: InviteEmailProps) => (
	<Html>
		<Head />
		<Body style={main}>
			<Preview>
				{`You've been invited to join ${companyName || "our team"} by ${
					inviterName || inviterEmail
				}`}
			</Preview>
			<Container style={container}>
				<Heading style={h1}>
					You've been invited to join {companyName || "our team"}
				</Heading>

				<Text style={text}>
					{inviterName ? `${inviterName} (${inviterEmail})` : inviterEmail} has
					invited you to join <strong>{companyName || "our team"}</strong>.
				</Text>

				{role && (
					<Text style={text}>
						You'll be joining as a <strong>{role}</strong>.
					</Text>
				)}

				<Text style={text}>
					Click the button below to accept the invitation and set up your
					account:
				</Text>

				<Section style={buttonSection}>
					<Button style={button} href={inviteUrl}>
						Join the team
					</Button>
				</Section>

				<Text style={fallbackText}>
					or copy and paste this URL into your browser:{" "}
					<Link href={inviteUrl} style={fallbackLink}>
						{inviteUrl}
					</Link>
				</Text>

				<Text
					style={{
						...text,
						color: "#ababab",
						marginTop: "14px",
						marginBottom: "16px",
					}}
				>
					If you didn't expect this invitation, you can safely ignore this
					email.
				</Text>
			</Container>
		</Body>
	</Html>
);

InviteEmail.PreviewProps = {
	inviteUrl: "https://example.com/invite?token=abc123",
	companyName: "OpsKingsTemplate",
	inviterName: "John Doe",
	inviterEmail: "john.doe@example.com",
	role: "Coach",
} as InviteEmailProps;

export default InviteEmail;

const main = {
	backgroundColor: "#ffffff",
};

const container = {
	paddingLeft: "12px",
	paddingRight: "12px",
	margin: "0 auto",
};

const h1 = {
	color: "#333",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "24px",
	fontWeight: "bold",
	margin: "40px 0",
	padding: "0",
};

const text = {
	color: "#333",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	margin: "24px 0",
	lineHeight: "24px",
};

const buttonSection = {
	marginTop: "32px",
	marginBottom: "32px",
	textAlign: "center" as const,
};

const button = {
	backgroundColor: "#000000",
	borderRadius: "5px",
	color: "#fff",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "12px",
	fontWeight: "600",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "inline-block",
	padding: "12px 20px",
	margin: "0",
};

const fallbackText = {
	color: "#000000",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	lineHeight: "24px",
	margin: "16px 0",
	textAlign: "left" as const,
};

const fallbackLink = {
	color: "#2563eb",
	textDecoration: "none",
};
