const nodemailer = require("nodemailer");
const { envConfig } = require("../config/config");
// import nodemailer from "nodemailer";

const sendmail = async (data) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", //here we have to choose which service to use
    auth: {
      //here we give the authentication details from the gmail id and app password
      user: envConfig.node_email,
      pass: envConfig.node_password,
    },
  });

  const mailOptions = {
    from: envConfig.node_email,
    to: data.to,
    subject: data.subject,
    text: data.text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("error sending mail");
  }
};

module.exports = {
  sendmail,
};
