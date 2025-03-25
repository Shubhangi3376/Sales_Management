export default function Footer() {
    return (
        <div style={{ padding: "15px 0", backgroundColor: "#28242c", textAlign: "center", position: "fixed", width: "100%", bottom: "0", left: "0", right: "0", boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.2)" }}>
            
            <div className="text-center">
                <h5 style={{ margin: "0", fontWeight: "500", color: "#ffffff", fontSize: "1rem" }}>
                    © {new Date().getFullYear()} <a href="https://shubhangi3376.github.io/html-portfolio/" style={{ textDecoration: "none", color: "#ffffff", fontWeight: "600" }}>Shubhangi Singh</a>. All Rights Reserved.
                </h5>
            </div>

            <div className="text-center pt-2">
                <a href="https://www.linkedin.com/in/shubhangi-singh-961788243/" target="_blank" rel="noreferrer">
                    <i className="bi bi-linkedin mx-2" style={{ fontSize: "20px", color: "#ffffff" }}></i>
                </a>
                
                <a href="https://github.com/shubhangi3376" target="_blank" rel="noreferrer">
                    <i className="bi bi-github mx-2" style={{ fontSize: "20px", color: "#ffffff" }}></i>
                </a>

                <a href="mailto:your-email@example.com" target="_blank" rel="noreferrer">
                    <i className="bi bi-envelope-fill mx-2" style={{ fontSize: "20px", color: "#ffffff" }}></i>
                </a>
            </div>
            
        </div>
    );
}
