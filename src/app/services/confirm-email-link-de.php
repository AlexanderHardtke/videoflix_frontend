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
        $resetLink = "https://dabubble.alexander-hardtke.com/reset-password/" . urlencode($token);
        $recipient = $email;
        $logo = "https://dabubble.alexander-hardtke.com/email-logo.png";
        $subject = "Email bestätigen / Confirm your email";
        $message = "
        <html>
        <head>
        <title>Passwort zurücksetzen</title>
        </head>
        <body>
        <p>Hallo,</p>
        <p>Wir haben kürzlich eine Anfrage zum Zurücksetzen deines Passworts erhalten. 
        Falls du diese Anfrage gestellt hast, 
        <br>
        klicke bitte auf den folgenden Link, 
        um dein Passwort zurückzusetzen:</p>
        <br>
        <a href='$resetLink'>Passwort zurücksetzen</a>
        <br>
        <br>
        <p>Falls du keine Anfrage zum Zurücksetzen deines Passworts gestellt hast, 
        ignoriere bitte diese E-Mail.
        </p>
        <br>
        <p>Beste Grüße,
        <br>
        Dein DABubble Team!
        </p>
        <br>
        <img src='$logo'>
        </body>
        </html>
        ";
        $headers = array();
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=utf-8';
        $headers[] = "From: info@dabubble.com";
        mail($recipient, $subject, $message, implode("\r\n", $headers));
        break;
    default:
        header("Allow: POST", true, 405);
        exit;
}