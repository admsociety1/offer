const express = require('express');
const bodyParser = require('body-parser');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const nodemailer = require('nodemailer');

const app = express();
const port = 5500;

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('./public'));


// Handle form submission
app.post('/submit', async (req, res) => {
    try {
        // Extract form data
        const formData = req.body;

        // Read the existing PDF file
        const pdfBytes = await fs.readFile('./public/new.pdf');

        // Load the existing PDF
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const secondPage = pages[1];

        // Embed bold font
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Add form data to the PDF
        firstPage.drawText(`${formData.joining}`, {
            x: 100,
            y: 657,
            size: 12,
            color: rgb(0, 0, 0),
        });
        firstPage.drawText(`Offer Letter For ${formData.post} Internship`, {
            x: 117,
            y: 621,
            size: 12,
            color: rgb(0, 0, 0),
        });
        // Draw the "name" field with bold font
        firstPage.drawText(`${formData.name},`, {
            x: 95,
            y: 582,
            size: 12,
            font: boldFont, // Use the bold font for the "name" field
            color: rgb(0, 0, 0),
        });

        // Draw the long text with justification
        const longText = `I am delighted & excited to welcome you to ADM EDUCATION & WELFARE
        SOCIETY as an ${formData.post} intern. We believe that our team is our biggest
        strength and we take pride in hiring ONLY the best and the brightest.
       
        We are confident that you would play a significant role in the overall
        success of the venture and we wish you the most enjoyable, learning
        packed and truly meaningful internship experience with ADM EDUCATION
        & WELFARE SOCIETY.

        Your appointment will be governed by the terms & condition presented in
        the Annexure A.

        We look forward to you joining us. Please do not hesitate to call us for any
        information you may need. Also, please sign at the end of this offer letter
        as your acceptance and forward the same to us.


        Congratulations!`;
        const lines = longText.split('\n');
        const fontSize = 14;
        let yPosition = 530;

        lines.forEach(line => {
            firstPage.drawText(line.trim(), {
                x: 58,
                y: yPosition,
                size: fontSize,
                color: rgb(0, 0, 0),
                lineHeight: 18, // Adjust as needed for line spacing
                textAlign:'justify',
            });
            yPosition -= 16; // Move to the next line
        });

        // Adjust the starting position for the second line of text on the second page
        let secondPageYPosition = 655;

        // Draw the second page text with justification
        secondPage.drawText(`You are being hired as a ${formData.post} intern and Mr. Rishabh will be your Reporting 
Manager and Mentor during the internship. Completing tasks assigned by the
supervisor, upholding the organization's values, and maintaining a high degree 
of professionalism with all stakeholders. You should arrive on time, follow
instructions, and improve the overall operations of the organization.`, {
            x: 100,
            y: secondPageYPosition,
            size: 14,
            color: rgb(0, 0, 0),
            lineHeight: 18,
            textAlign: 'justify' // Adding justification
        });

        // Update the Y position for the next line of text on the second page
        secondPageYPosition -= 18 * 7.5; // 9 lines, each with a lineHeight of 18

        // Draw the next paragraph on the second page
        secondPage.drawText(`Your date of joining is ${formData.joining}, and the duration of the internship
would be ${formData.tenure} months further expandable with prior notice. During this
time you are expected to devote your time and efforts solely to ADM
EDUCATION & WELFARE SOCIETY. You are also required to let your 
mentor know about forthcoming events (if there are any) in advance so 
that your work can be planned accordingly.`, {
            x: 95,
            y: secondPageYPosition,
            size: 14,
            color: rgb(0, 0, 0),
            lineHeight: 18,
            textAlign: 'justify', // Justify the text
        });

        // Save the modified PDF
        const modifiedPdfBytes = await pdfDoc.save();

        // Create a nodemailer transporter
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'officialhr.admsociety@gmail.com', // Your email address
                pass: 'gaqq qqxl fbap zxdh' // Your email password
            }
        });

        // Create an email message
       // Create an email message
let message = {
    from: 'officialhr.admsociety@gmail.com', // Sender address
    to: formData.email, // List of recipients
    subject: 'Offer Letter', // Subject line
    text: `Dear ${formData.name},\n\nI would like to take this opportunity on behalf of ADM Education & Welfare Society to welcome you on board and wish you all the best for your association with our organization.\n\nKindly find attached your formal offer letter and sign it and revert it to us enclosed with the following documents:\n\n1. 10th Class Marksheet\n2. Copy of Aadhar Card\n3. A passport-size photo.\n\nWe look forward to working with you.\n\nWith Regards,\n ADM Society`, // Plain text body
    attachments: [
        {
            filename: 'offer_letter.pdf',
            content: modifiedPdfBytes // Attached PDF file
        }
    ]
};

        // Send the email
        transporter.sendMail(message, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                res.status(500).send('Error sending email');
            } else {
                console.log('Email sent:', info.response);
                res.send('letter sent successfully');
                res.redirect('./public/index.html');
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error editing PDF');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
