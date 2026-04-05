import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");

  const [personal, setPersonal] = useState({
    title: "Mr.", gender: "Male",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    fatherName: "", dob: "",
    email: user?.email || "",
    mobile: user?.phone || "",
  });

  const [permAddress, setPermAddress] = useState({ line1: "", line2: "", city: "", state: "", district: "", pincode: "" });
  const [corrAddress, setCorrAddress] = useState({ line1: "", line2: "", city: "", state: "", district: "", pincode: "" });
  const [eduRows, setEduRows] = useState([
    { qualification: "", year: "", marks: "", board: "", college: "" },
    { qualification: "", year: "", marks: "", board: "", college: "" },
  ]);
  const [proRows, setProRows] = useState([{ qualification: "", institute: "", membershipNo: "", year: "", validity: "" }]);
  const [expRows, setExpRows] = useState([{ status: "", years: "", from: "", to: "", employer: "", designation: "", area: "" }]);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  const getInitials = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email;
    return "Member";
  };

  const sidebarItems = [
    { key: "personal",   icon: "👤", label: "Personal Details" },
    { key: "address",    icon: "📍", label: "Address Details" },
    { key: "education",  icon: "🎓", label: "Qualification Details" },
    { key: "work",       icon: "💼", label: "Experience Details" },
    { key: "membership", icon: "🪪", label: "Member Details" },
    { key: "payment",    icon: "💳", label: "Payment History" },
    { key: "scrutiny",   icon: "🔍", label: "Scrutiny Status" },
  ];

  return (
    <div style={styles.wrapper}>

      {/* TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.brand}>COV <span style={{ color: "#00a6a6" }}>India</span></div>
        <div style={styles.userPill}>
          <div style={styles.avatar}>{getInitials()}</div>
          <span style={styles.userName}>{getDisplayName()}</span>
        </div>
      </div>

      {/* MEMBER INFO BAR */}
      <div style={styles.memberInfoBar}>
        <span style={styles.memberTitle}>Member Profile</span>
        <InfoChip label="Membership No" value="COV-2025-04832" />
        <InfoChip label="Member Class" value="Associate" />
        <InfoChip label="Assets Class" value="Land & Building" />
        <InfoChip label="Status" value={<span style={styles.badgePending}>Pending</span>} />
        <button style={styles.previewBtn}>Preview Details</button>
      </div>

      {/* MAIN LAYOUT */}
      <div style={styles.mainLayout}>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          {sidebarItems.map((item) => (
            <div key={item.key}
              style={{ ...styles.sidebarItem, ...(activeTab === item.key ? styles.sidebarItemActive : {}) }}
              onClick={() => setActiveTab(item.key)}>
              <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div style={styles.sidebarDivider} />
          <div
            style={{ ...styles.sidebarItem, ...(activeTab === "password" ? styles.sidebarItemActive : {}) }}
            onClick={() => setActiveTab("password")}>
            <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>🔒</span>
            Change Password
          </div>
        </div>

        {/* CONTENT */}
        <div style={styles.contentArea}>

          {activeTab === "personal" && (
            <>
              <SectionCard title="Personal Details">
                <div style={styles.formGrid}>
                  <FormGroup label="Title">
                    <select style={styles.input} value={personal.title} onChange={e => setPersonal({ ...personal, title: e.target.value })}>
                      {["Mr.", "Ms.", "Dr.", "Prof."].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </FormGroup>
                  <FormGroup label="Gender">
                    <select style={styles.input} value={personal.gender} onChange={e => setPersonal({ ...personal, gender: e.target.value })}>
                      {["Male", "Female", "Other"].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </FormGroup>
                  <FormGroup label="First Name (as per PAN)">
                    <input style={styles.input} value={personal.firstName} onChange={e => setPersonal({ ...personal, firstName: e.target.value })} />
                  </FormGroup>
                  <FormGroup label="Last Name (as per PAN)">
                    <input style={styles.input} value={personal.lastName} onChange={e => setPersonal({ ...personal, lastName: e.target.value })} />
                  </FormGroup>
                  <FormGroup label="Father / Husband Name">
                    <input style={styles.input} value={personal.fatherName} onChange={e => setPersonal({ ...personal, fatherName: e.target.value })} />
                  </FormGroup>
                  <FormGroup label="Date of Birth (as per PAN)">
                    <input type="date" style={styles.input} value={personal.dob} onChange={e => setPersonal({ ...personal, dob: e.target.value })} />
                  </FormGroup>
                  <FormGroup label="Email Address">
                    <input type="email" style={styles.input} value={personal.email} onChange={e => setPersonal({ ...personal, email: e.target.value })} />
                  </FormGroup>
                  <FormGroup label="Mobile Number">
                    <input type="tel" style={styles.input} value={personal.mobile} onChange={e => setPersonal({ ...personal, mobile: e.target.value })} />
                  </FormGroup>
                </div>
              </SectionCard>
              <SectionCard title="Upload Documents">
                <div style={styles.uploadRow}>
                  {[
                    { icon: "🖼", label: "Profile Picture", hint: "JPG / PNG, max 2MB" },
                    { icon: "✍", label: "Signature", hint: "JPG / PNG, max 1MB" },
                    { icon: "📄", label: "PAN Card", hint: "PDF / JPG, max 2MB" },
                    { icon: "🪪", label: "Aadhar Card", hint: "PDF / JPG, max 2MB" },
                  ].map((u) => (
                    <div key={u.label} style={styles.uploadBox}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{u.icon}</div>
                      <div style={styles.uploadLabel}>{u.label}</div>
                      <div style={styles.uploadHint}>{u.hint}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>
              <button style={styles.saveBtn}>Save Changes</button>
            </>
          )}

          {activeTab === "address" && (
            <>
              <AddressSection title="Permanent Address" data={permAddress} setData={setPermAddress} />
              <AddressSection title="Correspondence Address" data={corrAddress} setData={setCorrAddress} />
              <button style={styles.saveBtn}>Save Changes</button>
            </>
          )}

          {activeTab === "education" && (
            <>
              <SectionCard title="Educational Qualification">
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead><tr>{["Qualification","Year","% Marks","Board/Univ","College","Upload"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {eduRows.map((row, i) => (
                        <tr key={i}>
                          <td style={styles.td}>
                            <select style={styles.tableInput} value={row.qualification} onChange={e=>{const r=[...eduRows];r[i].qualification=e.target.value;setEduRows(r);}}>
                              <option value="">Select</option>
                              {["10th","12th","Graduate","Postgraduate"].map(q=><option key={q}>{q}</option>)}
                            </select>
                          </td>
                          {["year","marks","board","college"].map(f=>(
                            <td key={f} style={styles.td}><input style={styles.tableInput} value={row[f]} placeholder={f} onChange={e=>{const r=[...eduRows];r[i][f]=e.target.value;setEduRows(r);}}/></td>
                          ))}
                          <td style={styles.td}><button style={styles.uploadBtn}>Upload</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button style={styles.addRowBtn} onClick={()=>setEduRows([...eduRows,{qualification:"",year:"",marks:"",board:"",college:""}])}>+ Add Row</button>
              </SectionCard>
              <SectionCard title="Professional Qualification">
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead><tr>{["Qualification","Institute","Membership No.","Year","Validity","Upload"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {proRows.map((row, i) => (
                        <tr key={i}>
                          {["qualification","institute","membershipNo","year","validity"].map(f=>(
                            <td key={f} style={styles.td}><input style={styles.tableInput} value={row[f]} placeholder={f} onChange={e=>{const r=[...proRows];r[i][f]=e.target.value;setProRows(r);}}/></td>
                          ))}
                          <td style={styles.td}><button style={styles.uploadBtn}>Upload</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button style={styles.addRowBtn} onClick={()=>setProRows([...proRows,{qualification:"",institute:"",membershipNo:"",year:"",validity:""}])}>+ Add Row</button>
              </SectionCard>
              <button style={styles.saveBtn}>Save Changes</button>
            </>
          )}

          {activeTab === "work" && (
            <>
              <SectionCard title="Work Experience">
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead><tr>{["Status","Total Years","From","To","Employer","Designation","Area","Upload"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {expRows.map((row, i) => (
                        <tr key={i}>
                          <td style={styles.td}>
                            <select style={styles.tableInput} value={row.status} onChange={e=>{const r=[...expRows];r[i].status=e.target.value;setExpRows(r);}}>
                              <option value="">Select</option><option>Employment</option><option>Practice</option>
                            </select>
                          </td>
                          {["years","from","to","employer","designation","area"].map(f=>(
                            <td key={f} style={styles.td}><input style={styles.tableInput} value={row[f]} placeholder={f} onChange={e=>{const r=[...expRows];r[i][f]=e.target.value;setExpRows(r);}}/></td>
                          ))}
                          <td style={styles.td}><button style={styles.uploadBtn}>Upload</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button style={styles.addRowBtn} onClick={()=>setExpRows([...expRows,{status:"",years:"",from:"",to:"",employer:"",designation:"",area:""}])}>+ Add Row</button>
              </SectionCard>
              <button style={styles.saveBtn}>Save Changes</button>
            </>
          )}

          {activeTab === "membership" && (
            <SectionCard title="Member Details">
              <div style={styles.formGrid}>
                {[
                  { label: "Membership Number", value: "COV-2025-04832" },
                  { label: "Member Class", value: "Associate" },
                  { label: "Assets Class", value: "Land & Building (CAT-I)" },
                  { label: "Membership Valid Till", value: "31 March 2026" },
                  { label: "Registration Date", value: "01 April 2025" },
                ].map(item => (
                  <FormGroup key={item.label} label={item.label}>
                    <input style={{ ...styles.input, background: "#e8f4f8", color: "#6b8099" }} value={item.value} readOnly />
                  </FormGroup>
                ))}
                <FormGroup label="Current Status">
                  <div style={{ paddingTop: 8 }}><span style={styles.badgePending}>Pending</span></div>
                </FormGroup>
              </div>
            </SectionCard>
          )}

          {activeTab === "payment" && (
            <>
              <div style={styles.payCards}>
                {[
                  { label: "Total Paid", value: "₹5,900", sub: "Lifetime" },
                  { label: "Last Payment", value: "₹3,000", sub: "01 Apr 2025" },
                  { label: "Next Due", value: "₹2,000", sub: "31 Mar 2026" },
                ].map(c => (
                  <div key={c.label} style={styles.payCard}>
                    <div style={styles.payLabel}>{c.label}</div>
                    <div style={styles.payValue}>{c.value}</div>
                    <div style={styles.paySub}>{c.sub}</div>
                  </div>
                ))}
              </div>
              <SectionCard title="Transaction History">
                {[
                  { title: "Annual Membership Fee", date: "01 Apr 2025", ref: "TXN202504010023", amount: "₹3,000", status: "Success" },
                  { title: "Registration Fee", date: "15 Jan 2025", ref: "TXN202501150011", amount: "₹2,900", status: "Success" },
                  { title: "Renewal Fee 2026", date: "Due: 31 Mar 2026", ref: "", amount: "₹2,000", status: "Pending" },
                ].map((tx, i) => (
                  <div key={i} style={styles.txRow}>
                    <div>
                      <div style={styles.txTitle}>{tx.title}</div>
                      <div style={styles.txDate}>{tx.date}{tx.ref ? ` · ${tx.ref}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={tx.status === "Success" ? styles.badgeSuccess : styles.badgePending}>{tx.status}</span>
                      <span style={{ ...styles.txAmount, color: tx.status === "Pending" ? "#856404" : "#0f6e56" }}>{tx.amount}</span>
                    </div>
                  </div>
                ))}
              </SectionCard>
            </>
          )}

          {activeTab === "scrutiny" && (
            <SectionCard title="Scrutiny Status">
              {[
                { title: "Application Submitted", date: "15 January 2025", note: "Your application has been received successfully.", done: true },
                { title: "Documents Verified", date: "22 January 2025", note: "All uploaded documents verified by the scrutiny team.", done: true },
                { title: "Under Review by Committee", date: "In Progress", note: "Your application is currently under review by the membership committee.", done: true },
                { title: "Final Approval", date: "Pending", note: null, done: false },
                { title: "Membership Card Issued", date: "Pending", note: null, done: false },
              ].map((step, i, arr) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ ...styles.stepDot, background: step.done ? "#00a6a6" : "#dee2e6" }} />
                    {i < arr.length - 1 && <div style={styles.stepConnector} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: step.done ? "#012a4a" : "#aaa" }}>{step.title}</div>
                    <div style={{ fontSize: 12, color: step.done ? "#6b8099" : "#bbb", marginTop: 2 }}>{step.date}</div>
                    {step.note && <div style={styles.stepNote}>{step.note}</div>}
                  </div>
                </div>
              ))}
            </SectionCard>
          )}

          {activeTab === "password" && (
            <SectionCard title="Change Password">
              <div style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: 16 }}>
                <FormGroup label="Current Password">
                  <input type="password" style={styles.input} placeholder="Enter current password" value={passwords.current} onChange={e=>setPasswords({...passwords,current:e.target.value})}/>
                </FormGroup>
                <FormGroup label="New Password">
                  <input type="password" style={styles.input} placeholder="Enter new password" value={passwords.newPass} onChange={e=>setPasswords({...passwords,newPass:e.target.value})}/>
                </FormGroup>
                <FormGroup label="Confirm New Password">
                  <input type="password" style={styles.input} placeholder="Confirm new password" value={passwords.confirm} onChange={e=>setPasswords({...passwords,confirm:e.target.value})}/>
                </FormGroup>
                <button style={{ ...styles.saveBtn, width: "fit-content" }}>Update Password</button>
              </div>
            </SectionCard>
          )}

        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div style={styles.sectionCard}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={styles.chipLabel}>{label}</span>
      <span style={styles.chipValue}>{value}</span>
    </div>
  );
}

function AddressSection({ title, data, setData }) {
  const states = ["Select State","Delhi","Karnataka","Maharashtra","Tamil Nadu","Uttar Pradesh","Gujarat"];
  return (
    <SectionCard title={title}>
      <div style={styles.formGrid}>
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={styles.label}>Address Line 1</label>
          <input style={styles.input} placeholder="House/Flat No, Street" value={data.line1} onChange={e=>setData({...data,line1:e.target.value})}/>
        </div>
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={styles.label}>Address Line 2</label>
          <input style={styles.input} placeholder="Locality, Area" value={data.line2} onChange={e=>setData({...data,line2:e.target.value})}/>
        </div>
        <FormGroup label="City"><input style={styles.input} placeholder="City" value={data.city} onChange={e=>setData({...data,city:e.target.value})}/></FormGroup>
        <FormGroup label="State">
          <select style={styles.input} value={data.state} onChange={e=>setData({...data,state:e.target.value})}>
            {states.map(s=><option key={s}>{s}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="District"><input style={styles.input} placeholder="District" value={data.district} onChange={e=>setData({...data,district:e.target.value})}/></FormGroup>
        <FormGroup label="Pincode"><input style={styles.input} placeholder="Pincode" value={data.pincode} onChange={e=>setData({...data,pincode:e.target.value})}/></FormGroup>
      </div>
    </SectionCard>
  );
}

const styles = {
  wrapper: { fontFamily: "'Segoe UI', sans-serif", background: "#f2f9ff", minHeight: "100vh", color: "#012a4a", marginTop: "100px" },
  topBar: { background: "#002b5b", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between"},
  brand: { color: "#fff", fontSize: 18, fontWeight: 600 },
  userPill: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", borderRadius: 50, padding: "6px 14px 6px 8px" },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#00a6a6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff" },
  userName: { color: "#fff", fontSize: 13 },
  memberInfoBar: { background: "#fff", borderBottom: "1px solid rgba(0,43,91,0.12)", padding: "18px 28px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" },
  memberTitle: { fontSize: 17, fontWeight: 600, color: "#002b5b", marginRight: 8 },
  chipLabel: { fontSize: 11, color: "#6b8099", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 },
  chipValue: { fontSize: 14, fontWeight: 600, color: "#012a4a" },
  badgePending: { background: "#fff3cd", color: "#856404", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  badgeSuccess: { background: "#d1f7e8", color: "#0f6e56", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  previewBtn: { marginLeft: "auto", background: "#00a6a6", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  mainLayout: { display: "flex", padding: "24px 28px", gap: 22, alignItems: "flex-start" },
  sidebar: { width: 220, flexShrink: 0, background: "#fff", borderRadius: 12, border: "0.5px solid rgba(0,43,91,0.12)", overflow: "hidden" },
  sidebarItem: { display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", fontSize: 13.5, cursor: "pointer", color: "#012a4a", borderLeft: "3px solid transparent", borderBottom: "0.5px solid rgba(0,43,91,0.1)" },
  sidebarItemActive: { background: "#f2f9ff", borderLeftColor: "#00a6a6", color: "#002b5b", fontWeight: 600 },
  sidebarDivider: { height: 1, background: "rgba(0,43,91,0.1)", margin: "4px 0" },
  contentArea: { flex: 1, minWidth: 0 },
  sectionCard: { background: "#fff", borderRadius: 12, border: "0.5px solid rgba(0,43,91,0.12)", padding: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#002b5b", borderBottom: "1px solid #e8f4f8", paddingBottom: 12, marginBottom: 20 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  label: { fontSize: 12, color: "#6b8099", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" },
  input: { border: "1px solid rgba(0,43,91,0.15)", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "#012a4a", background: "#f2f9ff", outline: "none", fontFamily: "inherit", width: "100%" },
  saveBtn: { background: "#002b5b", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  uploadRow: { display: "flex", gap: 16, flexWrap: "wrap" },
  uploadBox: { flex: 1, minWidth: 140, border: "1.5px dashed #00a6a6", borderRadius: 10, padding: 20, textAlign: "center", background: "#f0fdfc", cursor: "pointer" },
  uploadLabel: { fontSize: 13, fontWeight: 600, color: "#00a6a6", marginBottom: 4 },
  uploadHint: { fontSize: 12, color: "#6b8099" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
  th: { background: "#f2f9ff", color: "#002b5b", fontWeight: 600, padding: "10px 12px", textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.4px" },
  td: { padding: "10px 12px", borderBottom: "0.5px solid #e8f4f8", color: "#012a4a" },
  tableInput: { border: "1px solid rgba(0,43,91,0.15)", borderRadius: 6, padding: "5px 8px", fontSize: 13, background: "#f2f9ff", outline: "none", width: "100%" },
  uploadBtn: { background: "#00a6a6", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" },
  addRowBtn: { background: "none", border: "1px dashed #00a6a6", color: "#00a6a6", padding: "7px 16px", borderRadius: 7, fontSize: 13, cursor: "pointer", marginTop: 12 },
  payCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 },
  payCard: { background: "#f2f9ff", borderRadius: 10, border: "0.5px solid rgba(0,43,91,0.12)", padding: 16 },
  payLabel: { fontSize: 11, color: "#6b8099", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 },
  payValue: { fontSize: 22, fontWeight: 600, color: "#002b5b" },
  paySub: { fontSize: 12, color: "#6b8099", marginTop: 2 },
  txRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "0.5px solid #e8f4f8" },
  txTitle: { fontSize: 14, fontWeight: 500, color: "#012a4a" },
  txDate: { fontSize: 12, color: "#6b8099", marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: 600 },
  stepDot: { width: 14, height: 14, borderRadius: "50%", flexShrink: 0, marginTop: 3 },
  stepConnector: { width: 2, flex: 1, minHeight: 30, background: "#e8f4f8", margin: "4px 0" },
  stepNote: { fontSize: 12, color: "#6b8099", marginTop: 4, background: "#f2f9ff", borderRadius: 6, padding: "6px 10px" },
};

export default Dashboard;