function Committee() {
  const committees = [
    {
      icon: "👥",
      title: "Membership Committee",
      members: [
        { name: "Elakkiya D", role: "Member" },
        { name: "Gurbinder Singh", role: "Member" },
        { name: "Simul Sarkar", role: "Member" },
        { name: "Sudhir Kumar Singh", role: "Member" },
      ],
    },
    {
      icon: "⚖️",
      title: "Disciplinary Committee",
      members: [
        { name: "Babu G", role: "Member" },
        { name: "Siddant Arora", role: "Member" },
        { name: "Chaitanya K Srivastava", role: "Member" },
        { name: "Bhimrao Jaligama", role: "Member" },
      ],
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <h1>Committee Members</h1>
        <p>Meet the dedicated professionals leading COV's mission</p>
      </section>

      {/* MAIN CONTAINER */}
      <div className="committee-container">
        {committees.map((committee, i) => (
          <div className="committee-section" key={i}>
            <div className="committee-header">
              <div className="committee-icon">{committee.icon}</div>
              <h2>{committee.title}</h2>
            </div>
            <div className="members-grid">
              {committee.members.map((member, j) => (
                <div className="member-card" key={j}>
                  <div className="member-name">{member.name}</div>
                  <div className="member-role">{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Committee;