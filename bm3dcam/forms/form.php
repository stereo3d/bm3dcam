<?php
 	function sendmail($to,$subject,$message) {
 		$message = wordwrap($message, 70, "\r\n");
 		$headers[] = 'MIME-Version: 1.0';
		$headers[] = 'Content-type: text/html; charset=iso-8859-1';
 		$result=mail( $to, $subject, $message,implode("\r\n", $headers) );
    	return $result; 
 	}

 	$title="Notification";
 	if (isset($_POST['form_title'])) {$title=htmlspecialchars($_POST['form_title']); }
 	if (isset($_POST['form_email'])) {$email=htmlspecialchars($_POST['form_email']); } else {echo -1003; return;}

 	$message="";
 	foreach ($_POST as $key => $value) {
 		if (($key!="form_title") && ($key!="form_email")) {
			$message=$message.htmlspecialchars($key)." = ".htmlspecialchars($value)."<br>";
		}
 	}

 	$result=sendmail($email,$title,$message);
 	echo $result;
 	return;

 ?>
