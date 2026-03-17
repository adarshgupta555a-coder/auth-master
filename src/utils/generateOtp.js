export const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000);
}

export const generateOTPHTML = (otp) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>OTP Code</title>
</head>
<style>
*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial, sans-serif;
}

body{
height:100vh;
display:flex;
justify-content:center;
align-items:center;
background:#f2f4f8;
}

.otp-card{
background:white;
padding:40px;
border-radius:10px;
text-align:center;
box-shadow:0 10px 20px rgba(0,0,0,0.1);
width:320px;
}

.otp-card h2{
margin-bottom:10px;
}

.otp-card p{
color:#777;
margin-bottom:20px;
}

.otp-box{
font-size:32px;
letter-spacing:10px;
font-weight:bold;
color:#4285f4;
background:#f5f7ff;
padding:15px;
border-radius:8px;
}
</style>
<body>

<div class="otp-card">

    <h2>Your Verification Code</h2>
    <p>Use this OTP to verify your account</p>

    <div class="otp-box">
        ${otp}
    </div>

</div>

</body>
</html>
    `;
}