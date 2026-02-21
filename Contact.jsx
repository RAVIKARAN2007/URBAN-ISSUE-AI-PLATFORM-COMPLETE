import Navbar from "../components/Navbar"; 
import "./Contact.css";

export default function Contact() {
  return (
    <div className="contact-page">
      <Navbar />
      <div className="container contact-grid">
        <div className="contact-info">
          <h2 className="gradient-text">Get In Touch</h2>
          <p>For government collaborations or technical support.</p>
          <div className="contact-box glass-card">
            <p>📧 ravikaranm09@gmail.com</p>
            <p>📞 +91 9911380172</p>
            <p>🏢 VIPS New Delhi</p>
          </div>
        </div>

        <form className="glass-card contact-form">
          <h3>Send a Message</h3>
          <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Official Email" />
          <textarea placeholder="How can we help you?" rows="5"></textarea>
          <button type="submit">Send Application</button>
        </form>
      </div>
      <footer className="footer">
        © 2026 Urban Issue Intelligence Platform | Developed by Ravi Karan
      </footer>
    </div>
  );
}