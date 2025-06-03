<?php
switch ($_SERVER['REQUEST_METHOD']) {
    case ("OPTIONS"):
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: content-type");
        exit;
    case ("POST"):
        header("Access-Control-Allow-Origin: *");
        $json = file_get_contents('php://input');
        $params = json_decode($json);
        $email = $params->email;
        $token = $params->token;
        $mailServer = $params->mail_server;
        $frontendUrl = $params->frontend_url;
        $logo = $params->logo;
        $resetLink = $frontendUrl . urlencode($token);
        $recipient = $email;
        $subject = "Reset your password";
        $message = "
        <html>
        <head>
        <title>Reset your password</title> 
        </head>
        <body>
        <p>Hello,</p><br>
        <p>we recently received a request to reset your password. If you made this request,<br>
        please click on the following link to reset your password:<br></p>
        <br>
        <a href='$resetLink'
        style='display: inline-block;
            font-weight: 700;
            border-radius: 40px;
            background: linear-gradient(0deg, #121212 0%, #2E3EDF 50%, #2E3EDF 100%);
            background-size: 100% 200%;
            padding: 12px 24px;
            color: white;
            text-decoration: none;
            border: 1px solid #2E3EDF;
        '>
        Reset password</a>
        <br>
        <br>
        <p>Please note that for security reasons, this link is only valid for 24 hours.</p>
        <br>
        <p>If you did not request a password reset, please ignore this email.</p>
        <br>
        <p>Best Regards,
        <br>
        Your Videoflix team!
        </p>
        <br>
        <img src='$logo'>
        </body>
        </html>
        ";
        $headers = array();
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=utf-8';
        $headers[] = "From: Videoflix <$mailServer>";
        mail($recipient, $subject, $message, implode("\r\n", $headers));
        break;
    default:
        header("Allow: POST", true, 405);
        exit;
}