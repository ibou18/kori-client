import * as React from "react";

interface EmailForAdminProps {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export const EmailForAdmin: React.FC<Readonly<EmailForAdminProps>> = ({
  firstName,
  lastName,
  email,
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
        border: "1px solid #ddd",
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
            Nouvelle demande d&apos;assistance - {subject}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: "20px" }}>
            <p>Bonjour,</p>
            <p>
              Vous avez reçu une nouvelle demande d&lsquo;assistance de la part
              de :
            </p>
            <p>
              <strong>Nom :</strong> {firstName} {lastName}
            </p>
            <p>
              <strong>Email :</strong> {email}
            </p>
            <p>
              <strong>Sujet :</strong> {subject}
            </p>
            <p>
              <strong>Message :</strong>
            </p>
            <p>{message}</p>
            <p>Merci de traiter cette demande dès que possible.</p>
            <p>Cordialement,</p>
            <p>L&apos;`équipe d&apos;`assistance</p>
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
                href="https://sr3.app"
                style={{ color: "#1890ff", textDecoration: "none" }}
              >
                Solutions3r
              </a>
            </p>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
);
