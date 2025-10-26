import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  subject: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  subject,
  message,
}) => (
  <div
    style={{
      fontFamily: "Arial, sans-serif",
      lineHeight: "1.6",
      color: "#333",
    }}
  >
    <table
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        border: "1px solid #eae5e5",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f5f5f5" }}>
          <th
            style={{
              padding: "20px",
              textAlign: "center",
              fontSize: "24px",
              color: "#333",
            }}
          >
            Assistance - {subject}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: "20px" }}>
            <p>Bonjour {firstName},</p>
            <p>{message}</p>
            <p>
              Merci de nous avoir contactés. Nous reviendrons vers vous dès que
              possible.
            </p>
            <p>Cordialement,</p>
            <p>L&apos;équipe d&apos;assistance</p>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr style={{ backgroundColor: "#f5f5f5" }}>
          <td
            style={{
              padding: "10px",
              textAlign: "center",
              fontSize: "12px",
              color: "#777",
            }}
          >
            <p>
              © {new Date().getFullYear()} solutions3r. Tous droits réservés.
            </p>
            <p>
              <a
                href="https://s3r.app"
                style={{ color: "#1890ff", textDecoration: "none" }}
              >
                solutions3r
              </a>
            </p>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
);
