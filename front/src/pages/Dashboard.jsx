import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import PayButton from "../components/PayButton";

const STATES = [
  "Select State",
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli and Daman & Diu",
  "Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const MEMBER_ASSET_MAP = {
  "Student":     ["Plant, Equipment & Infrastructure","Land and Building","Business Valuation","Financial Instruments"],
  "Affiliate":   ["Affiliate (Land & Building Valuation)","Affiliate (Plant & Machinery Valuation)","Affiliate (Business Valuation)","Affiliate (Jewellery & Precious Assets)","Affiliate (Financial Instruments & Securities)"],
  "Chartered":   ["Plant, Equipment & Infrastructure","Land and Building","Business Valuation","Financial Instruments"],
  "Fellow":      ["Plant, Equipment & Infrastructure","Land and Building","Business Valuation","Financial Instruments"],
  "Institutional":["Corporate Membership","Institutional Membership"],
};

const MEMBER_TYPES = ["Monthly","Quarterly","Annual","Life"];

// Calculate validity based on member type
function calcValidity(type) {
  if (!type || type === "Life") return "";
  const now = new Date();
  let endYear = now.getFullYear();
  if (type === "Monthly") {
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return `${now.toLocaleString("default",{month:"long"})} ${now.getFullYear()}`;
  }
  if (type === "Quarterly") {
    const month = now.getMonth();
    if (month < 3) return `31 March ${now.getFullYear()}`;
    if (month < 6) return `30 June ${now.getFullYear()}`;
    if (month < 9) return `30 September ${now.getFullYear()}`;
    return `31 December ${now.getFullYear()}`;
  }
  if (type === "Annual") {
    // Financial year end: 31 March
    endYear = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
    return `31 March ${endYear}`;
  }
  return "";
}

const termsQuestions = [
  { name: "q1", text: "Have you ever been Convicted for an offence?", defaultYes: false },
  { name: "q2", text: "Whether any criminal proceeding is initiated against you and is pending for disposal before the court of law? (excluding litigation of personal/matrimonial nature)", defaultYes: false },
  { name: "q3", text: "Have you ever been declared as an undischarged bankrupt or applied to be adjudged as Bankrupt?", defaultYes: false },
  { name: "q4", text: "Have you ever been restrained by any public sector bank / any other institution to conduct valuation services and subsequently de-panelled from their panel?", defaultYes: false },
  { name: "q5", text: "Whether any disciplinary proceeding are pending or any disciplinary action has been taken at any time in the preceding three years against you by the institution / body of which you are a member?", defaultYes: false },
  { name: "q6", text: "Whether you had an unblemished service with the last employer in case of employment?", defaultYes: true },
  { name: "q7", text: "Whether your name appears in the database of MCA regarding:", defaultYes: false, hasSubList: true },
  { name: "q9", text: "Whether you have been penalised by a market regulator (SEBI or CCI) in the last 3 years?", defaultYes: false },
  { name: "q10", text: "Whether your name appears in the list of defaulters of RBI?", defaultYes: false },
];
const subQuestions = [
  { name: "q8a", text: "Directors disqualified under section 164 of companies act 2013" },
  { name: "q8b", text: "Proclaimed Offenders under section 82 of the code of Criminal Procedure, 1973?" },
];
const initAnswers = {};
termsQuestions.forEach(q => { initAnswers[q.name] = q.defaultYes ? "yes" : "no"; });
subQuestions.forEach(q => { initAnswers[q.name] = "no"; });

const NAV_TABS = ["personal","address","education","work","membership"];

const sidebarItems = [
  { key: "personal",   icon: "👤", label: "Personal Details" },
  { key: "address",    icon: "📍", label: "Address Details" },
  { key: "education",  icon: "🎓", label: "Qualification Details" },
  { key: "work",       icon: "💼", label: "Experience Details" },
  { key: "membership", icon: "🪪", label: "Member Details" },
  { key: "payment",    icon: "💳", label: "Payment History" },
  { key: "scrutiny",   icon: "🔍", label: "Scrutiny Status" },
];

function Dashboard() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("personal");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [topInfo, setTopInfo] = useState({
    memberClass: "", assetClass: "", membershipNo: user?.tempMembershipId || "", status: "Pending",
  });

  const [personal, setPersonal] = useState({
    title: "Mr.", gender: "Male",
    firstName: user?.firstName || "", lastName: user?.lastName || "",
    fatherName: "", dob: "", email: user?.email || "", mobile: user?.phone || "",
  });

  // Upload refs + file name display
  const pictureRef = useRef(null);
  const signatureRef = useRef(null);
  const panRef = useRef(null);
  const aadharRef = useRef(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [panFileName, setPanFileName] = useState("");
  const [aadharFileName, setAadharFileName] = useState("");

  const [permAddress, setPermAddress] = useState({ line1:"",line2:"",city:"",state:"Select State",district:"",pincode:"" });
  const [corrAddress, setCorrAddress] = useState({ line1:"",line2:"",city:"",state:"Select State",district:"",pincode:"" });
  const [sameAsMain, setSameAsMain] = useState(false);

  const handlePermChange = (field, value) => {
    const updated = { ...permAddress, [field]: value };
    setPermAddress(updated);
    if (sameAsMain) setCorrAddress({ ...updated });
  };
  const handleSameAsMain = (checked) => {
    setSameAsMain(checked);
    if (checked) setCorrAddress({ ...permAddress });
  };

  // Education rows + file names
  const [eduRows, setEduRows] = useState([
    { qualification:"",year:"",marks:"",board:"",college:"",fileName:"" },
    { qualification:"",year:"",marks:"",board:"",college:"",fileName:"" },
  ]);
  const eduFileRefs = useRef([]);

  // Professional rows + file names
  const [proRows, setProRows] = useState([
    { qualification:"",institute:"",membershipNo:"",year:"",validity:"",fileName:"" },
  ]);
  const proFileRefs = useRef([]);

  // Experience rows + file names
  const [expRows, setExpRows] = useState([
    { status:"",years:"",from:"",to:"",employer:"",designation:"",area:"",fileName:"" },
    { status:"",years:"",from:"",to:"",employer:"",designation:"",area:"",fileName:"" },
  ]);
  const expFileRefs = useRef([]);

  const [answers, setAnswers] = useState(initAnswers);

  const [memberDetails, setMemberDetails] = useState({
    memberClass:"", assetClass:"", memberType:"", validTill:"",
    membershipNo: user?.tempMembershipId || "", status:"Pending",
  });

  const [passwords, setPasswords] = useState({ current:"",newPass:"",confirm:"" });

  // ── HANDLE MEMBER TYPE CHANGE ──
  const handleMemberTypeChange = (type) => {
    const validTill = calcValidity(type);
    setMemberDetails(prev => ({ ...prev, memberType: type, validTill }));
  };

  // ── VALIDATION ──
  const validateSection = (tab) => {
    if (tab === "personal") return personal.firstName && personal.lastName && personal.email && personal.mobile && personal.dob && personal.gender;
    if (tab === "address") return permAddress.line1 && permAddress.city && permAddress.state !== "Select State" && permAddress.pincode;
    if (tab === "education") return eduRows.some(r => r.qualification && r.year);
    if (tab === "work") return expRows.some(r => r.employer && r.designation);
    if (tab === "membership") return memberDetails.memberClass && memberDetails.assetClass && memberDetails.memberType;
    return true;
  };
  const allSectionsValid = NAV_TABS.every(tab => validateSection(tab));

  const getMissingFields = () => {
    const m = [];
    if (!personal.firstName || !personal.lastName || !personal.email || !personal.mobile || !personal.dob) m.push("Personal: Fill all required fields (name, email, mobile, DOB)");
    if (!permAddress.line1 || !permAddress.city || permAddress.state === "Select State" || !permAddress.pincode) m.push("Address: Fill permanent address completely");
    if (!eduRows.some(r => r.qualification && r.year)) m.push("Qualifications: Add at least one educational qualification");
    if (!expRows.some(r => r.employer && r.designation)) m.push("Experience: Add at least one work experience entry");
    if (!memberDetails.memberClass || !memberDetails.assetClass || !memberDetails.memberType) m.push("Member Details: Select Member Class, Asset Class and Member Type");
    return m;
  };

  // ── FETCH PROFILE ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok || !data.success) return;
        const u = data.data;
        if (u.personal) {
          setPersonal(prev => ({
            ...prev,
            title: u.personal.title || prev.title,
            gender: u.personal.gender || prev.gender,
            firstName: u.firstName || prev.firstName,
            lastName: u.lastName || prev.lastName,
            fatherName: u.personal.fatherName || "",
            dob: u.personal.dob || "",
            email: u.email || prev.email,
            mobile: u.personal.mobile || u.phone || "",
          }));
        }
        if (u.permAddress) setPermAddress(u.permAddress);
        if (u.corrAddress) setCorrAddress(u.corrAddress);
        if (u.education && u.education.length > 0) setEduRows(u.education);
        if (u.professionalQualification && u.professionalQualification.length > 0) setProRows(u.professionalQualification);
        if (u.experience && u.experience.length > 0) setExpRows(u.experience);
        if (u.memberDetails) {
          setMemberDetails(prev => ({ ...prev, ...u.memberDetails, membershipNo: u.tempMembershipId || prev.membershipNo }));
          setTopInfo({ memberClass: u.memberDetails.memberClass || "", assetClass: u.memberDetails.assetClass || "", membershipNo: u.tempMembershipId || "", status: u.memberDetails.status || "Pending" });
        } else if (u.tempMembershipId) {
          setMemberDetails(prev => ({ ...prev, membershipNo: u.tempMembershipId }));
          setTopInfo(prev => ({ ...prev, membershipNo: u.tempMembershipId }));
        }
      } catch (err) { console.error("fetchProfile error:", err.message); }
    };
    if (token) fetchProfile();
  }, [token]);

  // ── SAVE HANDLERS ──
  const showSaveMsg = (msg) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  const savePersonal = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/personal", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName: personal.firstName, lastName: personal.lastName, email: personal.email, personal: { title: personal.title, gender: personal.gender, fatherName: personal.fatherName, dob: personal.dob, mobile: personal.mobile } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showSaveMsg("✅ Personal details saved!");
    } catch (err) { showSaveMsg("❌ " + err.message); } finally { setSaving(false); }
  };

  const saveAddress = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ permAddress, corrAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showSaveMsg("✅ Address saved!");
    } catch (err) { showSaveMsg("❌ " + err.message); } finally { setSaving(false); }
  };

  const saveMemberDetails = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/member-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ memberDetails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTopInfo({ memberClass: memberDetails.memberClass, assetClass: memberDetails.assetClass, membershipNo: memberDetails.membershipNo, status: memberDetails.status });
      showSaveMsg("✅ Member details saved!");
    } catch (err) { showSaveMsg("❌ " + err.message); } finally { setSaving(false); }
  };

  const saveEducation = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/education", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ education: eduRows, professionalQualification: proRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showSaveMsg("✅ Educational & Professional qualifications saved!");
    } catch (err) { showSaveMsg("❌ " + err.message); } finally { setSaving(false); }
  };

  const saveExperience = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ experience: expRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showSaveMsg("✅ Experience details saved!");
    } catch (err) { showSaveMsg("❌ " + err.message); } finally { setSaving(false); }
  };

  const goNext = () => {
    const idx = NAV_TABS.indexOf(activeTab);
    if (idx < NAV_TABS.length - 1) setActiveTab(NAV_TABS[idx + 1]);
  };

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

  const assetOptions = MEMBER_ASSET_MAP[memberDetails.memberClass] || [];

  const RadioGroup = ({ name }) => (
    <div style={{ display: "flex", gap: 16 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
        <input type="radio" name={name} value="yes" checked={answers[name]==="yes"} onChange={()=>setAnswers({...answers,[name]:"yes"})} /> Yes
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
        <input type="radio" name={name} value="no" checked={answers[name]==="no"} onChange={()=>setAnswers({...answers,[name]:"no"})} /> No
      </label>
    </div>
  );

  // ── PREVIEW PAGE ──
  if (showPreview) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.topBar}>
          <div style={styles.brand}>COV <span style={{ color: "#00a6a6" }}>India</span></div>
          <div style={styles.userPill}>
            <div style={styles.avatar}>{getInitials()}</div>
            <span style={styles.userName}>{getDisplayName()}</span>
          </div>
        </div>
        <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,43,91,0.12)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#002b5b" }}>Member Preview</h2>
          <button onClick={() => setShowPreview(false)} style={{ background: "none", border: "1px solid #002b5b", color: "#002b5b", padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Back</button>
        </div>
        <div style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>Personal Details</h3>
              <PreviewTable rows={[["Title",personal.title],["First Name",personal.firstName],["Last Name",personal.lastName],["Gender",personal.gender],["Date of Birth",personal.dob],["Father / Husband Name",personal.fatherName],["Email",personal.email],["Mobile",personal.mobile]]} />
            </div>
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>Address Details</h3>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#00a6a6", marginBottom: 8, textTransform: "uppercase" }}>Permanent Address</p>
              <PreviewTable rows={[["Address",`${permAddress.line1}${permAddress.line2?", "+permAddress.line2:""}`],["City",permAddress.city],["State",permAddress.state],["District",permAddress.district],["Pincode",permAddress.pincode]]} />
              <p style={{ fontSize: 12, fontWeight: 600, color: "#00a6a6", margin: "16px 0 8px", textTransform: "uppercase" }}>Correspondence Address</p>
              <PreviewTable rows={[["Address",`${corrAddress.line1}${corrAddress.line2?", "+corrAddress.line2:""}`],["City",corrAddress.city],["State",corrAddress.state],["Pincode",corrAddress.pincode]]} />
            </div>
          </div>
          <div style={{ ...styles.sectionCard, marginBottom: 24 }}>
            <h3 style={styles.sectionTitle}>Membership Details</h3>
            <PreviewTable rows={[
              ["Membership Number", memberDetails.membershipNo],
              ["Member Class", memberDetails.memberClass],
              ["Assets Class", memberDetails.assetClass],
              ["Member Type", memberDetails.memberType],
              ...(memberDetails.memberType !== "Life" ? [["Valid Till", memberDetails.validTill]] : []),
            ]} />
          </div>
          <div style={{ ...styles.sectionCard, marginBottom: 24 }}>
            <h3 style={styles.sectionTitle}>Qualification Details</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead><tr>{["Qualification","Year","% Marks","Board/Univ","College","File"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {eduRows.filter(r=>r.qualification).map((row,i)=>(
                    <tr key={i}>
                      <td style={styles.td}>{row.qualification||"—"}</td>
                      <td style={styles.td}>{row.year||"—"}</td>
                      <td style={styles.td}>{row.marks||"—"}</td>
                      <td style={styles.td}>{row.board||"—"}</td>
                      <td style={styles.td}>{row.college||"—"}</td>
                      <td style={styles.td}>{row.fileName ? <span style={{ color: "#00a6a6", fontSize: 12 }}>📎 {row.fileName}</span> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ ...styles.sectionCard, marginBottom: 24 }}>
            <h3 style={styles.sectionTitle}>Experience Details</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead><tr>{["Status","Years","From","To","Employer","Designation","Area","File"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {expRows.filter(r=>r.employer).map((row,i)=>(
                    <tr key={i}>
                      <td style={styles.td}>{row.status||"—"}</td>
                      <td style={styles.td}>{row.years||"—"}</td>
                      <td style={styles.td}>{row.from||"—"}</td>
                      <td style={styles.td}>{row.to||"—"}</td>
                      <td style={styles.td}>{row.employer||"—"}</td>
                      <td style={styles.td}>{row.designation||"—"}</td>
                      <td style={styles.td}>{row.area||"—"}</td>
                      <td style={styles.td}>{row.fileName ? <span style={{ color: "#00a6a6", fontSize: 12 }}>📎 {row.fileName}</span> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            {!allSectionsValid && (
              <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#856404", width: "100%", maxWidth: 460 }}>
                <strong>Please complete the following before submitting:</strong>
                <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
                  {getMissingFields().map((f,i)=><li key={i}>{f}</li>)}
                </ul>
              </div>
            )}
            <PayButton allSectionsValid={allSectionsValid} token={token} />
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN DASHBOARD ──
  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <div style={styles.brand}>COV <span style={{ color: "#00a6a6" }}>India</span></div>
        <div style={styles.userPill}>
          <div style={styles.avatar}>{getInitials()}</div>
          <span style={styles.userName}>{getDisplayName()}</span>
        </div>
      </div>

      <div style={styles.memberInfoBar}>
        <span style={styles.memberTitle}>Member Profile</span>
        <InfoChip label="Membership No" value={topInfo.membershipNo || "—"} />
        <InfoChip label="Member Class" value={topInfo.memberClass || "—"} />
        <InfoChip label="Assets Class" value={topInfo.assetClass || "—"} />
        <InfoChip label="Status" value={<span style={topInfo.status==="Active" ? styles.badgeActive : styles.badgePending}>{topInfo.status||"Pending"}</span>} />
        <button style={styles.previewBtn} onClick={() => setShowPreview(true)}>Preview Details</button>
      </div>

      {saveMsg && (
        <div style={{ padding: "10px 28px", fontSize: 13, fontWeight: 500, background: saveMsg.startsWith("✅") ? "#d1f7e8" : "#fde8e8", color: saveMsg.startsWith("✅") ? "#0f6e56" : "#c0392b", borderBottom: "1px solid rgba(0,43,91,0.08)" }}>
          {saveMsg}
        </div>
      )}

      <div style={styles.mainLayout}>
        <div style={styles.sidebar}>
          {sidebarItems.map(item => (
            <div key={item.key}
              style={{ ...styles.sidebarItem, ...(activeTab===item.key ? styles.sidebarItemActive : {}) }}
              onClick={() => setActiveTab(item.key)}>
              <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div style={styles.sidebarDivider} />
          <div style={{ ...styles.sidebarItem, ...(activeTab==="password" ? styles.sidebarItemActive : {}) }} onClick={() => setActiveTab("password")}>
            <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>🔒</span> Change Password
          </div>
        </div>

        <div style={styles.contentArea}>

          {/* ── PERSONAL ── */}
          {activeTab === "personal" && (
            <>
              <SectionCard title="Personal Details">
                <div style={styles.formGrid}>
                  <FormGroup label="Title">
                    <select style={styles.input} value={personal.title} onChange={e=>setPersonal({...personal,title:e.target.value})}>
                      {["Mr.","Ms.","Dr.","Prof."].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </FormGroup>
                  <FormGroup label="Gender">
                    <select style={styles.input} value={personal.gender} onChange={e=>setPersonal({...personal,gender:e.target.value})}>
                      {["Male","Female","Other"].map(g=><option key={g}>{g}</option>)}
                    </select>
                  </FormGroup>
                  <FormGroup label="First Name (as per PAN) *">
                    <input style={styles.input} value={personal.firstName} onChange={e=>setPersonal({...personal,firstName:e.target.value})} />
                  </FormGroup>
                  <FormGroup label="Last Name (as per PAN) *">
                    <input style={styles.input} value={personal.lastName} onChange={e=>setPersonal({...personal,lastName:e.target.value})} />
                  </FormGroup>
                  <FormGroup label="Father / Husband Name">
                    <input style={styles.input} value={personal.fatherName} onChange={e=>setPersonal({...personal,fatherName:e.target.value})} />
                  </FormGroup>
                  <FormGroup label="Date of Birth (as per PAN) *">
                    <input type="date" style={styles.input} value={personal.dob} onChange={e=>setPersonal({...personal,dob:e.target.value})} />
                  </FormGroup>
                  <FormGroup label="Email Address *">
                    <input type="email" style={styles.input} value={personal.email} onChange={e=>setPersonal({...personal,email:e.target.value})} />
                  </FormGroup>
                  <FormGroup label="Mobile Number *">
                    <input type="tel" style={styles.input} value={personal.mobile} onChange={e=>setPersonal({...personal,mobile:e.target.value})} />
                  </FormGroup>
                </div>
              </SectionCard>
              <SectionCard title="Upload Documents">
                <div style={styles.uploadRow}>
                  <UploadBox label="Profile Picture" hint="JPG/PNG, max 2MB" icon="🖼"
                    preview={picturePreview} inputRef={pictureRef} accept="image/*"
                    onChange={e=>{const f=e.target.files[0];if(f)setPicturePreview(URL.createObjectURL(f));}} />
                  <UploadBox label="Signature" hint="JPG/PNG, max 1MB" icon="✍"
                    preview={signaturePreview} inputRef={signatureRef} accept="image/*"
                    onChange={e=>{const f=e.target.files[0];if(f)setSignaturePreview(URL.createObjectURL(f));}} />
                  <UploadBox label="PAN Card" hint="PDF/JPG, max 2MB" icon="📄"
                    fileName={panFileName} inputRef={panRef} accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e=>{const f=e.target.files[0];if(f)setPanFileName(f.name);}} />
                  <UploadBox label="Aadhar Card" hint="PDF/JPG, max 2MB" icon="🪪"
                    fileName={aadharFileName} inputRef={aadharRef} accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e=>{const f=e.target.files[0];if(f)setAadharFileName(f.name);}} />
                </div>
              </SectionCard>
              <NavButtons onSave={savePersonal} saving={saving} onNext={goNext} />
            </>
          )}

          {/* ── ADDRESS ── */}
          {activeTab === "address" && (
            <>
              <SectionCard title="Permanent Address">
                <div style={styles.formGrid}>
                  <div style={{ gridColumn:"1/-1", display:"flex", flexDirection:"column", gap:5 }}>
                    <label style={styles.label}>Address Line 1 *</label>
                    <input style={styles.input} placeholder="House/Flat No, Street" value={permAddress.line1} onChange={e=>handlePermChange("line1",e.target.value)} />
                  </div>
                  <div style={{ gridColumn:"1/-1", display:"flex", flexDirection:"column", gap:5 }}>
                    <label style={styles.label}>Address Line 2</label>
                    <input style={styles.input} placeholder="Locality, Area" value={permAddress.line2} onChange={e=>handlePermChange("line2",e.target.value)} />
                  </div>
                  <FormGroup label="City *"><input style={styles.input} placeholder="City" value={permAddress.city} onChange={e=>handlePermChange("city",e.target.value)} /></FormGroup>
                  <FormGroup label="State *">
                    <select style={styles.input} value={permAddress.state} onChange={e=>handlePermChange("state",e.target.value)}>
                      {STATES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </FormGroup>
                  <FormGroup label="District"><input style={styles.input} placeholder="District" value={permAddress.district} onChange={e=>handlePermChange("district",e.target.value)} /></FormGroup>
                  <FormGroup label="Pincode *"><input style={styles.input} placeholder="Pincode" value={permAddress.pincode} onChange={e=>handlePermChange("pincode",e.target.value)} /></FormGroup>
                </div>
              </SectionCard>
              <SectionCard title="Correspondence Address">
                <label style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, cursor:"pointer", fontSize:14, color:"#002b5b", fontWeight:500 }}>
                  <input type="checkbox" checked={sameAsMain} onChange={e=>handleSameAsMain(e.target.checked)} style={{ width:16, height:16, accentColor:"#00a6a6", cursor:"pointer" }} />
                  Same as Permanent Address
                </label>
                <div style={styles.formGrid}>
                  <div style={{ gridColumn:"1/-1", display:"flex", flexDirection:"column", gap:5 }}>
                    <label style={styles.label}>Address Line 1</label>
                    <input style={{ ...styles.input, ...(sameAsMain?styles.inputReadonly:{}) }} placeholder="House/Flat No, Street" value={corrAddress.line1} readOnly={sameAsMain} onChange={e=>setCorrAddress({...corrAddress,line1:e.target.value})} />
                  </div>
                  <div style={{ gridColumn:"1/-1", display:"flex", flexDirection:"column", gap:5 }}>
                    <label style={styles.label}>Address Line 2</label>
                    <input style={{ ...styles.input, ...(sameAsMain?styles.inputReadonly:{}) }} placeholder="Locality, Area" value={corrAddress.line2} readOnly={sameAsMain} onChange={e=>setCorrAddress({...corrAddress,line2:e.target.value})} />
                  </div>
                  <FormGroup label="City"><input style={{ ...styles.input, ...(sameAsMain?styles.inputReadonly:{}) }} placeholder="City" value={corrAddress.city} readOnly={sameAsMain} onChange={e=>setCorrAddress({...corrAddress,city:e.target.value})} /></FormGroup>
                  <FormGroup label="State">
                    <select style={{ ...styles.input, ...(sameAsMain?styles.inputReadonly:{}) }} value={corrAddress.state} disabled={sameAsMain} onChange={e=>setCorrAddress({...corrAddress,state:e.target.value})}>
                      {STATES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </FormGroup>
                  <FormGroup label="District"><input style={{ ...styles.input, ...(sameAsMain?styles.inputReadonly:{}) }} placeholder="District" value={corrAddress.district} readOnly={sameAsMain} onChange={e=>setCorrAddress({...corrAddress,district:e.target.value})} /></FormGroup>
                  <FormGroup label="Pincode"><input style={{ ...styles.input, ...(sameAsMain?styles.inputReadonly:{}) }} placeholder="Pincode" value={corrAddress.pincode} readOnly={sameAsMain} onChange={e=>setCorrAddress({...corrAddress,pincode:e.target.value})} /></FormGroup>
                </div>
              </SectionCard>
              <NavButtons onSave={saveAddress} saving={saving} onNext={goNext} />
            </>
          )}

          {/* ── EDUCATION ── */}
          {activeTab === "education" && (
            <>
              <SectionCard title="Educational Qualification">
                <div style={{ overflowX:"auto" }}>
                  <table style={styles.table}>
                    <thead><tr>{["Qualification","Year","% Marks","Board/Univ","College","Upload"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {eduRows.map((row,i)=>(
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
                          <td style={styles.td}>
                            <button style={styles.uploadBtn} type="button" onClick={()=>eduFileRefs.current[i]?.click()}>Upload</button>
                            {row.fileName && <div style={{ fontSize:11, color:"#00a6a6", marginTop:4, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>📎 {row.fileName}</div>}
                            <input type="file" accept=".pdf,.jpg,.png" style={{ display:"none" }} ref={el=>(eduFileRefs.current[i]=el)}
                              onChange={e=>{const f=e.target.files[0];if(f){const r=[...eduRows];r[i].fileName=f.name;setEduRows(r);}}} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button style={styles.addRowBtn} onClick={()=>setEduRows([...eduRows,{qualification:"",year:"",marks:"",board:"",college:"",fileName:""}])}>+ Add Row</button>
              </SectionCard>
              <SectionCard title="Professional Qualification">
                <div style={{ overflowX:"auto" }}>
                  <table style={styles.table}>
                    <thead><tr>{["Qualification","Institute","Membership No.","Year","Validity","Upload"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {proRows.map((row,i)=>(
                        <tr key={i}>
                          {["qualification","institute","membershipNo","year","validity"].map(f=>(
                            <td key={f} style={styles.td}><input style={styles.tableInput} value={row[f]} placeholder={f} onChange={e=>{const r=[...proRows];r[i][f]=e.target.value;setProRows(r);}}/></td>
                          ))}
                          <td style={styles.td}>
                            <button style={styles.uploadBtn} type="button" onClick={()=>proFileRefs.current[i]?.click()}>Upload</button>
                            {row.fileName && <div style={{ fontSize:11, color:"#00a6a6", marginTop:4, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>📎 {row.fileName}</div>}
                            <input type="file" accept=".pdf,.jpg,.png" style={{ display:"none" }} ref={el=>(proFileRefs.current[i]=el)}
                              onChange={e=>{const f=e.target.files[0];if(f){const r=[...proRows];r[i].fileName=f.name;setProRows(r);}}} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button style={styles.addRowBtn} onClick={()=>setProRows([...proRows,{qualification:"",institute:"",membershipNo:"",year:"",validity:"",fileName:""}])}>+ Add Row</button>
              </SectionCard>
              <NavButtons onSave={saveEducation} saving={saving} onNext={goNext} />
            </>
          )}

          {/* ── WORK ── */}
          {activeTab === "work" && (
            <>
              <SectionCard title="Work Experience">
                <div style={{ overflowX:"auto" }}>
                  <table style={styles.table}>
                    <thead><tr>{["Status","Total Years","From","To","Employer","Designation","Area","Upload"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {expRows.map((row,i)=>(
                        <tr key={i}>
                          <td style={styles.td}>
                            <select style={styles.tableInput} value={row.status} onChange={e=>{const r=[...expRows];r[i].status=e.target.value;setExpRows(r);}}>
                              <option value="">Select</option><option>Employment</option><option>Practice</option>
                            </select>
                          </td>
                          {["years","from","to","employer","designation","area"].map(f=>(
                            <td key={f} style={styles.td}><input style={styles.tableInput} value={row[f]} placeholder={f} onChange={e=>{const r=[...expRows];r[i][f]=e.target.value;setExpRows(r);}}/></td>
                          ))}
                          <td style={styles.td}>
                            <button style={styles.uploadBtn} type="button" onClick={()=>expFileRefs.current[i]?.click()}>Upload</button>
                            {row.fileName && <div style={{ fontSize:11, color:"#00a6a6", marginTop:4, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>📎 {row.fileName}</div>}
                            <input type="file" accept=".pdf,.jpg,.png" style={{ display:"none" }} ref={el=>(expFileRefs.current[i]=el)}
                              onChange={e=>{const f=e.target.files[0];if(f){const r=[...expRows];r[i].fileName=f.name;setExpRows(r);}}} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button style={styles.addRowBtn} onClick={()=>setExpRows([...expRows,{status:"",years:"",from:"",to:"",employer:"",designation:"",area:"",fileName:""}])}>+ Add Row</button>
              </SectionCard>
              <SectionCard title="Declaration">
                <ul style={{ listStyle:"none", padding:0, margin:0 }}>
                  {termsQuestions.map(q=>(
                    <li key={q.name} style={{ borderBottom:"0.5px solid #e8f4f8" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, padding:"14px 0", flexWrap:"wrap" }}>
                        <span style={{ fontSize:13.5, color:"#012a4a", flex:1, lineHeight:1.6 }}>{q.text}</span>
                        <RadioGroup name={q.name} />
                      </div>
                      {q.hasSubList && (
                        <ul style={{ listStyle:"none", padding:"0 0 0 24px", margin:0 }}>
                          {subQuestions.map(sq=>(
                            <li key={sq.name} style={{ borderTop:"0.5px solid #f0f0f0" }}>
                              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, padding:"12px 0", flexWrap:"wrap" }}>
                                <span style={{ fontSize:13, color:"#444", flex:1, lineHeight:1.6 }}>{sq.text}</span>
                                <RadioGroup name={sq.name} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </SectionCard>
              <NavButtons onSave={saveExperience} saving={saving} onNext={goNext} />
            </>
          )}

          {/* ── MEMBER DETAILS ── */}
          {activeTab === "membership" && (
            <SectionCard title="Member Details">
              <div style={styles.formGrid}>

                {/* Temp Membership ID — read only */}
                <FormGroup label="Membership Number (Auto-generated)">
                  <input style={{ ...styles.input, ...styles.inputReadonly, fontWeight:600, color:"#002b5b", cursor: "not-allowed" }}
                    value={memberDetails.membershipNo || "Generating..."} readOnly />
                </FormGroup>

                {/* Member Class */}
                <FormGroup label="Member Class *">
                  <select style={styles.input} value={memberDetails.memberClass}
                    onChange={e=>setMemberDetails({...memberDetails,memberClass:e.target.value,assetClass:""})}>
                    <option value="">Select Member Class</option>
                    {Object.keys(MEMBER_ASSET_MAP).map(c=><option key={c}>{c}</option>)}
                  </select>
                </FormGroup>

                {/* Asset Class */}
                <FormGroup label="Assets Class *">
                  {assetOptions.length > 0 ? (
                    <select style={styles.input} value={memberDetails.assetClass}
                      onChange={e=>setMemberDetails({...memberDetails,assetClass:e.target.value})}>
                      <option value="">Select Asset Class</option>
                      {assetOptions.map(a=><option key={a}>{a}</option>)}
                    </select>
                  ) : (
                    <input style={{ ...styles.input, ...styles.inputReadonly }} value="Select a Member Class first" readOnly />
                  )}
                </FormGroup>

                {/* Member Type */}
                <FormGroup label="Member Type *">
                  <select style={styles.input} value={memberDetails.memberType} onChange={e=>handleMemberTypeChange(e.target.value)}>
                    <option value="">Select Member Type</option>
                    {MEMBER_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </FormGroup>

                {/* Valid Till — hidden for Life */}
                {memberDetails.memberType && memberDetails.memberType !== "Life" && (
                  <FormGroup label="Membership Valid Till (Auto-calculated)">
                    <input style={{ ...styles.input, ...styles.inputReadonly, fontWeight:600, color:"#002b5b" }}
                      value={memberDetails.validTill || "—"} readOnly />
                  </FormGroup>
                )}

                {memberDetails.memberType === "Life" && (
                  <FormGroup label="Membership Valid Till">
                    <input style={{ ...styles.input, ...styles.inputReadonly }} value="Lifetime — No Expiry" readOnly />
                  </FormGroup>
                )}

              </div>

              {(memberDetails.memberClass || memberDetails.assetClass) && (
                <div style={{ marginTop:16, padding:"12px 16px", background:"#f0fdfc", borderRadius:8, border:"1px solid #00a6a6", fontSize:13, color:"#007070" }}>
                  ℹ️ Top bar will update after pressing <strong>Save Changes</strong>.
                </div>
              )}

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:24 }}>
                <button style={{ ...styles.saveBtn, opacity:saving?0.7:1 }} onClick={saveMemberDetails} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button style={{ ...styles.saveBtn, background:"#00a6a6", padding:"10px 24px" }}
                  onClick={()=>{ saveMemberDetails(); setTimeout(()=>setShowPreview(true),500); }}>
                  Next & Preview →
                </button>
              </div>
            </SectionCard>
          )}

          {/* ── PAYMENT ── */}
          {activeTab === "payment" && (
            <>
              <div style={styles.payCards}>
                {[{label:"Total Paid",value:"₹5,900",sub:"Lifetime"},{label:"Last Payment",value:"₹3,000",sub:"01 Apr 2025"},{label:"Next Due",value:"₹2,000",sub:"31 Mar 2026"}].map(c=>(
                  <div key={c.label} style={styles.payCard}>
                    <div style={styles.payLabel}>{c.label}</div>
                    <div style={styles.payValue}>{c.value}</div>
                    <div style={styles.paySub}>{c.sub}</div>
                  </div>
                ))}
              </div>
              <SectionCard title="Transaction History">
                {[{title:"Annual Membership Fee",date:"01 Apr 2025",ref:"TXN202504010023",amount:"₹3,000",status:"Success"},{title:"Registration Fee",date:"15 Jan 2025",ref:"TXN202501150011",amount:"₹2,900",status:"Success"},{title:"Renewal Fee 2026",date:"Due: 31 Mar 2026",ref:"",amount:"₹2,000",status:"Pending"}].map((tx,i)=>(
                  <div key={i} style={styles.txRow}>
                    <div>
                      <div style={styles.txTitle}>{tx.title}</div>
                      <div style={styles.txDate}>{tx.date}{tx.ref?` · ${tx.ref}`:""}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <span style={tx.status==="Success"?styles.badgeSuccess:styles.badgePending}>{tx.status}</span>
                      <span style={{ ...styles.txAmount, color:tx.status==="Pending"?"#856404":"#0f6e56" }}>{tx.amount}</span>
                    </div>
                  </div>
                ))}
              </SectionCard>
            </>
          )}

          {/* ── SCRUTINY ── */}
          {activeTab === "scrutiny" && (
            <SectionCard title="Scrutiny Status">
              {[{title:"Application Submitted",date:"15 January 2025",note:"Your application has been received successfully.",done:true},{title:"Documents Verified",date:"22 January 2025",note:"All uploaded documents verified by the scrutiny team.",done:true},{title:"Under Review by Committee",date:"In Progress",note:"Your application is currently under review by the membership committee.",done:true},{title:"Final Approval",date:"Pending",note:null,done:false},{title:"Membership Card Issued",date:"Pending",note:null,done:false}].map((step,i,arr)=>(
                <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{ ...styles.stepDot, background:step.done?"#00a6a6":"#dee2e6" }} />
                    {i<arr.length-1 && <div style={styles.stepConnector} />}
                  </div>
                  <div style={{ flex:1, paddingBottom:24 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:step.done?"#012a4a":"#aaa" }}>{step.title}</div>
                    <div style={{ fontSize:12, color:step.done?"#6b8099":"#bbb", marginTop:2 }}>{step.date}</div>
                    {step.note && <div style={styles.stepNote}>{step.note}</div>}
                  </div>
                </div>
              ))}
            </SectionCard>
          )}

          {/* ── PASSWORD ── */}
          {activeTab === "password" && (
            <SectionCard title="Change Password">
              <div style={{ maxWidth:400, display:"flex", flexDirection:"column", gap:16 }}>
                <FormGroup label="Current Password"><input type="password" style={styles.input} placeholder="Enter current password" value={passwords.current} onChange={e=>setPasswords({...passwords,current:e.target.value})}/></FormGroup>
                <FormGroup label="New Password"><input type="password" style={styles.input} placeholder="Enter new password" value={passwords.newPass} onChange={e=>setPasswords({...passwords,newPass:e.target.value})}/></FormGroup>
                <FormGroup label="Confirm New Password"><input type="password" style={styles.input} placeholder="Confirm new password" value={passwords.confirm} onChange={e=>setPasswords({...passwords,confirm:e.target.value})}/></FormGroup>
                <button style={{ ...styles.saveBtn, width:"fit-content" }}>Update Password</button>
              </div>
            </SectionCard>
          )}

        </div>
      </div>
    </div>
  );
}

/* ── HELPER COMPONENTS ── */
function UploadBox({ label, hint, icon, preview, fileName, inputRef, accept, onChange }) {
  return (
    <div style={styles.uploadBox} onClick={() => inputRef.current.click()}>
      {preview
        ? <img src={preview} alt={label} style={{ width:60, height:60, objectFit:"cover", borderRadius:8, marginBottom:8 }} />
        : <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>}
      <div style={styles.uploadLabel}>{label}</div>
      <div style={styles.uploadHint}>{hint}</div>
      {fileName && <div style={{ fontSize:11, color:"#00a6a6", marginTop:6, wordBreak:"break-all" }}>📎 {fileName}</div>}
      <input type="file" ref={inputRef} accept={accept} style={{ display:"none" }} onChange={onChange} />
    </div>
  );
}

function NavButtons({ onSave, saving, onNext }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 }}>
      <button style={{ ...styles.saveBtn, opacity:saving?0.7:1 }} onClick={onSave} disabled={saving}>
        {saving?"Saving...":"Save Changes"}
      </button>
      <button style={{ ...styles.saveBtn, background:"#00a6a6" }} onClick={onNext}>Next →</button>
    </div>
  );
}

function PreviewTable({ rows }) {
  return (
    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
      <tbody>
        {rows.map(([label,value],i)=>(
          <tr key={i}>
            <td style={{ padding:"8px 12px", color:"#6b8099", fontWeight:500, width:"45%", borderBottom:"0.5px solid #e8f4f8", fontSize:12, textTransform:"uppercase", letterSpacing:"0.3px" }}>{label}</td>
            <td style={{ padding:"8px 12px", color:"#012a4a", borderBottom:"0.5px solid #e8f4f8", fontWeight:500 }}>{value||"—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div style={{ display:"flex", flexDirection:"column" }}>
      <span style={styles.chipLabel}>{label}</span>
      <span style={styles.chipValue}>{value}</span>
    </div>
  );
}

const styles = {
  wrapper: { fontFamily:"'Segoe UI', sans-serif", background:"#f2f9ff", minHeight:"100vh", color:"#012a4a", marginTop:"100px" },
  topBar: { background:"#002b5b", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  brand: { color:"#fff", fontSize:18, fontWeight:600 },
  userPill: { display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.1)", borderRadius:50, padding:"6px 14px 6px 8px" },
  avatar: { width:32, height:32, borderRadius:"50%", background:"#00a6a6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600, color:"#fff" },
  userName: { color:"#fff", fontSize:13 },
  memberInfoBar: { background:"#fff", borderBottom:"1px solid rgba(0,43,91,0.12)", padding:"18px 28px", display:"flex", alignItems:"center", gap:32, flexWrap:"wrap" },
  memberTitle: { fontSize:17, fontWeight:600, color:"#002b5b", marginRight:8 },
  chipLabel: { fontSize:11, color:"#6b8099", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:2 },
  chipValue: { fontSize:14, fontWeight:600, color:"#012a4a" },
  badgePending: { background:"#fff3cd", color:"#856404", padding:"4px 14px", borderRadius:20, fontSize:12, fontWeight:600 },
  badgeActive:  { background:"#d1f7e8", color:"#0f6e56", padding:"4px 14px", borderRadius:20, fontSize:12, fontWeight:600 },
  badgeSuccess: { background:"#d1f7e8", color:"#0f6e56", padding:"4px 14px", borderRadius:20, fontSize:12, fontWeight:600 },
  previewBtn: { marginLeft:"auto", background:"#00a6a6", color:"#fff", border:"none", padding:"9px 20px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" },
  mainLayout: { display:"flex", padding:"24px 28px", gap:22, alignItems:"flex-start" },
  sidebar: { width:220, flexShrink:0, background:"#fff", borderRadius:12, border:"0.5px solid rgba(0,43,91,0.12)", overflow:"hidden" },
  sidebarItem: { display:"flex", alignItems:"center", gap:12, padding:"13px 18px", fontSize:13.5, cursor:"pointer", color:"#012a4a", borderLeft:"3px solid transparent", borderBottom:"0.5px solid rgba(0,43,91,0.1)" },
  sidebarItemActive: { background:"#f2f9ff", borderLeftColor:"#00a6a6", color:"#002b5b", fontWeight:600 },
  sidebarDivider: { height:1, background:"rgba(0,43,91,0.1)", margin:"4px 0" },
  contentArea: { flex:1, minWidth:0 },
  sectionCard: { background:"#fff", borderRadius:12, border:"0.5px solid rgba(0,43,91,0.12)", padding:24, marginBottom:20 },
  sectionTitle: { fontSize:15, fontWeight:600, color:"#002b5b", borderBottom:"1px solid #e8f4f8", paddingBottom:12, marginBottom:20 },
  formGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  label: { fontSize:12, color:"#6b8099", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.4px" },
  input: { border:"1px solid rgba(0,43,91,0.15)", borderRadius:8, padding:"9px 12px", fontSize:14, color:"#012a4a", background:"#f2f9ff", outline:"none", fontFamily:"inherit", width:"100%" },
  inputReadonly: { background:"#e8f4f8", color:"#6b8099" },
  saveBtn: { background:"#002b5b", color:"#fff", border:"none", padding:"10px 28px", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" },
  uploadRow: { display:"flex", gap:16, flexWrap:"wrap" },
  uploadBox: { flex:1, minWidth:140, border:"1.5px dashed #00a6a6", borderRadius:10, padding:20, textAlign:"center", background:"#f0fdfc", cursor:"pointer" },
  uploadLabel: { fontSize:13, fontWeight:600, color:"#00a6a6", marginBottom:4 },
  uploadHint: { fontSize:12, color:"#6b8099" },
  table: { width:"100%", borderCollapse:"collapse", fontSize:13.5 },
  th: { background:"#f2f9ff", color:"#002b5b", fontWeight:600, padding:"10px 12px", textAlign:"left", fontSize:12, textTransform:"uppercase", letterSpacing:"0.4px" },
  td: { padding:"10px 12px", borderBottom:"0.5px solid #e8f4f8", color:"#012a4a" },
  tableInput: { border:"1px solid rgba(0,43,91,0.15)", borderRadius:6, padding:"5px 8px", fontSize:13, background:"#f2f9ff", outline:"none", width:"100%" },
  uploadBtn: { background:"#00a6a6", color:"#fff", border:"none", padding:"5px 12px", borderRadius:6, fontSize:12, cursor:"pointer" },
  addRowBtn: { background:"none", border:"1px dashed #00a6a6", color:"#00a6a6", padding:"7px 16px", borderRadius:7, fontSize:13, cursor:"pointer", marginTop:12 },
  payCards: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:16, marginBottom:20 },
  payCard: { background:"#f2f9ff", borderRadius:10, border:"0.5px solid rgba(0,43,91,0.12)", padding:16 },
  payLabel: { fontSize:11, color:"#6b8099", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 },
  payValue: { fontSize:22, fontWeight:600, color:"#002b5b" },
  paySub: { fontSize:12, color:"#6b8099", marginTop:2 },
  txRow: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"0.5px solid #e8f4f8" },
  txTitle: { fontSize:14, fontWeight:500, color:"#012a4a" },
  txDate: { fontSize:12, color:"#6b8099", marginTop:2 },
  txAmount: { fontSize:15, fontWeight:600 },
  stepDot: { width:14, height:14, borderRadius:"50%", flexShrink:0, marginTop:3 },
  stepConnector: { width:2, flex:1, minHeight:30, background:"#e8f4f8", margin:"4px 0" },
  stepNote: { fontSize:12, color:"#6b8099", marginTop:4, background:"#f2f9ff", borderRadius:6, padding:"6px 10px" },
};

export default Dashboard;