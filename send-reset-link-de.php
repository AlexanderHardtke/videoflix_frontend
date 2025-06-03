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
        $subject = "Passwort zurücksetzen";
        $message = "
        <html>
        <head>
        <title>Passwort zurücksetzen</title> 
        </head>
        <body>
        <p>Hallo,</p><br>
        <p>wir haben kürzlich eine Anfrage zum Zurücksetzen deines Passworts erhalten. Falls du diese Anfrage gestellt hast,<br>
        klicke bitte auf den folgenden Link, um dein Passwort zurückzusetzen: <br></p>
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
        Passwort zurücksetzen</a>
        <br>
        <br>
        <p>Bitte beachte, dieser Link ist aus Sicherheitsgründen nur 24 Stunden gültig.</p>
        <br>
        <p>Falls du keine Anfrage zum Zurücksetzen deines Passworts gestellt hast, 
        ignoriere bitte diese E-Mail.</p>
        <br>
        <p>Beste Grüße,
        <br>
        Dein Videoflix Team!
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