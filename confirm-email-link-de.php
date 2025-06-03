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
        $activateLink = $frontendUrl . urlencode($token);
        $recipient = $email;
        $subject = "Bestätige deine E-Mail";
        $message = "
        <html>
        <head>
        <title>Bestätige deine E-Mail</title> 
        </head>
        <body>
        <img  style='display:flex; place-self: center;' src='$logo'>
        <p>Lieber Videoflixnutzer,</p>
        <p>danke das du dich bei <b style='color:#2E3EDF;'>Videoflix</b> registriert hast</b>.
        Um deine Registrierung abzuschließen und deine E-Mail zu bestätigen, klicke bitte auf den Link hier unten:<br></p>
        <br>
        <a href='$activateLink'
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
        Aktiviere Nutzerkonto</a>
        <br>
        <br>
        <p>Falls du kein Konto bei uns erstellt hast, ignoriere bitte diese E-Mail.</p>
        <br>
        <p>Beste Grüße,
        <br>
        Dein Videoflix Team!
        </p>
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