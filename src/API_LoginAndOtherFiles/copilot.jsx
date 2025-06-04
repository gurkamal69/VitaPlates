import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export default function App() {
  return (
    <html lang="en">
      <body>
        <CopilotKit publicApiKey="ck_pub_bcd10982e430cfd34f04ee6d4b6e4113">
          <CopilotPopup
            labels={{
              title: "Popup Assistant",
              initial: "How can I help you today?"
            }}
            instructions="AI help that shows up right when you need it"
          />
        </CopilotKit>
      </body>
    </html>
  );
}
