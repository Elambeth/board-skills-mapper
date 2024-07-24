import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import html2canvas from 'html2canvas';
import { Linkedin } from 'lucide-react';



const INITIAL_SKILLS_LIST = [
  "Financial Acumen", "Governance", "Industry Experience", "Fundraising",
  "Legal Expertise", "Strategic Planning", "Marketing/PR", "Technology/IT",
  "Human Resources", "Community Outreach"
];

function HelpButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
    >
      ?
    </button>
  );
}

function HelpPopup({ onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="help-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900">How to use the Board Skills Mapper</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              1. Add board members and their skills.<br/>
              2. View the skill analysis and distribution.<br/>
              3. Use the analysis to identify areas for improvement in your board's skill composition.<br/>
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-2">Board Skills Mapper</h3>
            <p className="text-sm text-gray-300">A tool part of the NFP Toolkit</p>
          </div>
          <div className="text-center">
            <p className="text-sm">&copy; 2024 NFP Toolkit. All rights reserved.</p>
          </div>
          <div className="text-center md:text-right">
            <a 
              href="https://www.linkedin.com/company/nfp-toolkit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-white hover:text-blue-400 transition-colors duration-200"
            >
              <Linkedin size={20} className="mr-2" />
              <span>Follow us on LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BoardSkillsMapper() {
  const [boardMembers, setBoardMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberSkills, setNewMemberSkills] = useState([]);
  const [skillsList, setSkillsList] = useState(INITIAL_SKILLS_LIST);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillAnalysis, setSkillAnalysis] = useState([]);
  const [recruitmentRecommendation, setRecruitmentRecommendation] = useState('');
  const [spiderData, setSpiderData] = useState([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const boardMembersRef = useRef(null);
  const skillAnalysisRef = useRef(null);
  const skillDistributionRef = useRef(null);

  useEffect(() => {
    if (boardMembers.length > 0) {
      generateSkillAnalysis();
    }
  }, [boardMembers, skillsList]);

  const addBoardMember = (e) => {
    e.preventDefault();
    if (newMemberName && newMemberSkills.length > 0) {
      setBoardMembers([...boardMembers, { name: newMemberName, skills: newMemberSkills }]);
      setNewMemberName('');
      setNewMemberSkills([]);
    }
  };

  const toggleSkill = (skill) => {
    setNewMemberSkills(newMemberSkills.includes(skill)
      ? newMemberSkills.filter(s => s !== skill)
      : [...newMemberSkills, skill]
    );
  };

  const generateSkillAnalysis = () => {
    const skillCounts = {};
    skillsList.forEach(skill => {
      skillCounts[skill] = boardMembers.filter(member => member.skills.includes(skill)).length;
    });
  
    const totalMembers = boardMembers.length;
    const skillFractions = Object.entries(skillCounts).map(([skill, count]) => ({
      skill,
      count,
      fraction: `${count}/${totalMembers}`,
      ratio: count / totalMembers
    }));
  
    skillFractions.sort((a, b) => b.ratio - a.ratio);
  
    setSkillAnalysis(skillFractions);
  
    const skillsToRecruit = skillFractions.filter(s => s.count === 0).map(s => s.skill);
    const lowestSkills = skillFractions.slice(-5).reverse().map(s => s.skill);
  
    let recommendation = "";
    if (skillsToRecruit.length > 0) {
      recommendation += `Consider recruiting members with expertise in: ${skillsToRecruit.join(", ")}.`;
    }
    if (lowestSkills.length > 0) {
      if (recommendation) recommendation += "\n";
      recommendation += `To strengthen your board, also consider focusing on: ${lowestSkills.join(", ")}.`;
    }
  
    setRecruitmentRecommendation(recommendation);
  
    const spiderData = skillsList.map(skill => ({
      skill,
      value: skillCounts[skill]
    }));
    setSpiderData(spiderData);
  };

  const addNewSkill = () => {
    if (newSkill && !skillsList.includes(newSkill)) {
      setSkillsList([...skillsList, newSkill]);
      setNewSkill('');
      setIsModalOpen(false);
    }
  };

  const downloadAsImage = async (ref, filename) => {
    const element = ref.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');

    if (typeof link.download === 'string') {
      link.href = data;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">Board Recruitment Skills Mapper</h1>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Board Member</h2>
              <form onSubmit={addBoardMember} className="space-y-6">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter board member name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                        newMemberSkills.includes(skill)
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200"
                  >
                    + Add Skill
                  </button>
                </div>
                <button 
                  type="submit" 
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                >
                  Add Board Member
                </button>
              </form>
            </div>
          </div>

          <div ref={boardMembersRef} className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Current Board Members</h2>
                <button
                  onClick={() => downloadAsImage(boardMembersRef, 'board_members.png')}
                  className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  Download
                </button>
              </div>
              {boardMembers.length === 0 ? (
                <p className="text-gray-500 italic">No board members added yet.</p>
              ) : (
                <ul className="space-y-4">
                  {boardMembers.map((member, index) => (
                    <li key={index} className="border border-gray-200 rounded-md p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{member.name}</h3>
                      <div className="flex flex-wrap gap-1 items-center">
                        {member.skills.map((skill, skillIndex) => (
                          <span 
                            key={skillIndex} 
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium relative z-0"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {boardMembers.length > 0 && (
            <div ref={skillAnalysisRef} className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Board Skill Analysis</h2>
                  <button
                    onClick={() => downloadAsImage(skillAnalysisRef, 'skill_analysis.png')}
                    className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    Download
                  </button>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Distribution</h3>
                  <ul className="space-y-2 mb-6">
                    {skillAnalysis.map(({ skill, fraction, ratio }, index) => {
                      const percentage = ratio * 100;
                      return (
                        <li key={index} className="flex items-center">
                          <span className="w-1/3 text-gray-700">{skill}</span>
                          <div className="w-2/3 flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{fraction}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {recruitmentRecommendation && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <h4 className="text-lg font-semibold text-blue-800 mb-2">Recruitment Recommendations</h4>
                      <p className="text-blue-700 whitespace-pre-line">
                        {recruitmentRecommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {spiderData.length > 0 && (
            <div ref={skillDistributionRef} className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Skill Distribution</h2>
                  <button
                    onClick={() => downloadAsImage(skillDistributionRef, 'skill_distribution.png')}
                    className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    Download
                  </button>
                </div>
                <div className="w-full h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={spiderData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis />
                      <Radar name="Skills" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Skill</h3>
                  <div className="mt-2 px-7 py-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Enter new skill"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="items-center px-4 py-3">
                    <button
                      onClick={addNewSkill}
                      className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      Add Skill
                    </button>
                  </div>
                  <div className="items-center px-4 py-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <HelpButton onClick={() => setIsHelpOpen(true)} />
      {isHelpOpen && <HelpPopup onClose={() => setIsHelpOpen(false)} />}
    </>
  );
}

export default BoardSkillsMapper;