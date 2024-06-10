const MailServices = {
  sendMail: async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw error;
    }
  },
};

export default MailServices;
