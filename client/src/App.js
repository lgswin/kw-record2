import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5001/api';

function App() {
  const [activeTab, setActiveTab] = useState('members');

  return (
    <div className="App">
      <header className="App-header">
        <h1>KW한인장로교회 관리 시스템</h1>
      </header>
      
      <nav className="nav-tabs">
        <button 
          className={activeTab === 'members' ? 'nav-tab active' : 'nav-tab'}
          onClick={() => setActiveTab('members')}
        >
          성도 관리
        </button>
        <button 
          className={activeTab === 'families' ? 'nav-tab active' : 'nav-tab'}
          onClick={() => setActiveTab('families')}
        >
          가족 관리
        </button>
        <button 
          className={activeTab === 'parties' ? 'nav-tab active' : 'nav-tab'}
          onClick={() => setActiveTab('parties')}
        >
          순모임 관리
        </button>
        <button 
          className={activeTab === 'departments' ? 'nav-tab active' : 'nav-tab'}
          onClick={() => setActiveTab('departments')}
        >
          부서 관리
        </button>
      </nav>

      <main className="container">
        {activeTab === 'members' && <MemberManagement />}
        {activeTab === 'families' && <FamilyManagement />}
        {activeTab === 'parties' && <PartyManagement />}
        {activeTab === 'departments' && <DepartmentManagement />}
      </main>
    </div>
  );
}

// 성도 관리 컴포넌트
function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [offices, setOffices] = useState([]);
  const [families, setFamilies] = useState([]);
  const [parties, setParties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', gender: '',
    birth_date: '', baptized: false, baptism_date: '', registration_date: '',
    office_id: '', family_id: '', party_id: '', department_id: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchOffices();
    fetchFamilies();
    fetchParties();
    fetchDepartments();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/members`);
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('성도 목록 조회 오류:', error);
      alert('성도 목록을 가져올 수 없습니다.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffices = async () => {
    try {
      const response = await axios.get(`${API_URL}/offices`);
      setOffices(response.data);
    } catch (error) {
      console.error('직분 목록 조회 오류:', error);
    }
  };

  const fetchFamilies = async () => {
    try {
      const response = await axios.get(`${API_URL}/families`);
      setFamilies(response.data);
    } catch (error) {
      console.error('가족 목록 조회 오류:', error);
    }
  };

  const fetchParties = async () => {
    try {
      const response = await axios.get(`${API_URL}/parties`);
      setParties(response.data);
    } catch (error) {
      console.error('순모임 목록 조회 오류:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_URL}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('부서 목록 조회 오류:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('이름과 전화번호는 필수입니다.');
      return;
    }

    try {
      const submitData = {
        ...formData,
        baptized: formData.baptized === true || formData.baptized === 'true'
      };

      if (editingId) {
        await axios.put(`${API_URL}/members/${editingId}`, submitData);
        alert('성도 정보가 수정되었습니다.');
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/members`, submitData);
        alert('새 성도가 추가되었습니다.');
      }
      
      setFormData({
        name: '', phone: '', address: '', gender: '',
        birth_date: '', baptized: false, baptism_date: '', registration_date: '',
        office_id: '', family_id: '', department_id: ''
      });
      fetchMembers();
    } catch (error) {
      console.error('성도 저장 오류:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name || '',
      phone: member.phone || '',
      address: member.address || '',
      gender: member.gender || '',
      birth_date: member.birth_date || '',
      baptized: member.baptized || false,
      baptism_date: member.baptism_date || '',
      registration_date: member.registration_date || '',
      office_id: '', family_id: '', party_id: '', department_id: ''
    });
    setEditingId(member.id);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: '', phone: '', address: '', gender: '',
      birth_date: '', baptized: false, baptism_date: '', registration_date: '',
      office_id: '', family_id: '', party_id: '', department_id: ''
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 성도를 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_URL}/members/${id}`);
      alert('성도가 삭제되었습니다.');
      fetchMembers();
    } catch (error) {
      console.error('성도 삭제 오류:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div>
      <section className="form-section">
        <h2>{editingId ? '성도 정보 수정' : '새 성도 등록'}</h2>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-row">
            <div className="form-group">
              <label>이름 *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>전화번호 *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>주소</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>성별</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="">선택</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </select>
            </div>
            <div className="form-group">
              <label>생년월일</label>
              <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>세례 여부</label>
              <input type="checkbox" name="baptized" checked={formData.baptized} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>세례일자</label>
              <input type="date" name="baptism_date" value={formData.baptism_date} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>등록일</label>
              <input type="date" name="registration_date" value={formData.registration_date} onChange={handleInputChange} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? '수정' : '등록'}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">취소</button>}
          </div>
        </form>
      </section>

      <section className="list-section">
        <h2>성도 목록</h2>
        {loading ? <p>로딩 중...</p> : members.length === 0 ? <p>등록된 성도가 없습니다.</p> : (
          <div className="members-list">
            {members.map(member => (
              <div key={member.id} className="member-card">
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p>{member.phone}</p>
                  {member.address && <p>주소: {member.address}</p>}
                  {member.gender && <p>성별: {member.gender === 'M' ? '남성' : '여성'}</p>}
                  {member.birth_date && <p>생년월일: {member.birth_date}</p>}
                  <small>등록일: {new Date(member.created_at).toLocaleDateString()}</small>
                </div>
                <div className="member-actions">
                  <button onClick={() => handleEdit(member)} className="btn btn-edit">수정</button>
                  <button onClick={() => handleDelete(member.id)} className="btn btn-delete">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// 가족 관리 컴포넌트
function FamilyManagement() {
  const [families, setFamilies] = useState([]);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ family_name: '', member_ids: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFamilies();
    fetchMembers();
  }, []);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/families`);
      setFamilies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('가족 목록 조회 오류:', error);
      alert('가족 목록을 가져올 수 없습니다.');
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/members`);
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('성도 목록 조회 오류:', error);
      setMembers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberToggle = (memberId) => {
    setFormData(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(memberId)
        ? prev.member_ids.filter(id => id !== memberId)
        : [...prev.member_ids, memberId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.family_name.trim()) {
      alert('가족명을 입력해주세요.');
      return;
    }

    try {
      await axios.post(`${API_URL}/families`, formData);
      alert('가족이 등록되었습니다.');
      setFormData({ family_name: '', member_ids: [] });
      fetchFamilies();
    } catch (error) {
      console.error('가족 등록 오류:', error);
      alert('등록에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 가족을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_URL}/families/${id}`);
      alert('가족이 삭제되었습니다.');
      fetchFamilies();
    } catch (error) {
      console.error('가족 삭제 오류:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div>
      <section className="form-section">
        <h2>새 가족 등록</h2>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>가족명 *</label>
            <input type="text" name="family_name" value={formData.family_name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>가족 구성원 선택</label>
            <div className="checkbox-list">
              {members.map(member => (
                <label key={member.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.member_ids.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                  />
                  {member.name} ({member.phone})
                </label>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">등록</button>
          </div>
        </form>
      </section>

      <section className="list-section">
        <h2>가족 목록</h2>
        {loading ? <p>로딩 중...</p> : families.length === 0 ? <p>등록된 가족이 없습니다.</p> : (
          <div className="members-list">
            {families.map(family => (
              <div key={family.id} className="member-card">
                <div className="member-info">
                  <h3>{family.family_name}</h3>
                  {family.members && <p>구성원: {family.members}</p>}
                  <small>등록일: {new Date(family.created_at).toLocaleDateString()}</small>
                </div>
                <div className="member-actions">
                  <button onClick={() => handleDelete(family.id)} className="btn btn-delete">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// 순모임 관리 컴포넌트
function PartyManagement() {
  const [parties, setParties] = useState([]);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ party_name: '', leader_id: '', member_ids: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchParties();
    fetchMembers();
  }, []);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/parties`);
      setParties(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('순모임 목록 조회 오류:', error);
      alert('순모임 목록을 가져올 수 없습니다.');
      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/members`);
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('성도 목록 조회 오류:', error);
      setMembers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberToggle = (memberId) => {
    setFormData(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(memberId)
        ? prev.member_ids.filter(id => id !== memberId)
        : [...prev.member_ids, memberId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.party_name.trim()) {
      alert('순명을 입력해주세요.');
      return;
    }

    try {
      await axios.post(`${API_URL}/parties`, formData);
      alert('순모임이 등록되었습니다.');
      setFormData({ party_name: '', leader_id: '', member_ids: [] });
      fetchParties();
    } catch (error) {
      console.error('순모임 등록 오류:', error);
      alert('등록에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 순모임을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_URL}/parties/${id}`);
      alert('순모임이 삭제되었습니다.');
      fetchParties();
    } catch (error) {
      console.error('순모임 삭제 오류:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div>
      <section className="form-section">
        <h2>새 순모임 등록</h2>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>순명 *</label>
            <input type="text" name="party_name" value={formData.party_name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>순장 선택</label>
            <select name="leader_id" value={formData.leader_id} onChange={handleInputChange}>
              <option value="">선택 안 함</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>순원 선택</label>
            <div className="checkbox-list">
              {members.map(member => (
                <label key={member.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.member_ids.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                  />
                  {member.name} ({member.phone})
                </label>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">등록</button>
          </div>
        </form>
      </section>

      <section className="list-section">
        <h2>순모임 목록</h2>
        {loading ? <p>로딩 중...</p> : parties.length === 0 ? <p>등록된 순모임이 없습니다.</p> : (
          <div className="members-list">
            {parties.map(party => (
              <div key={party.id} className="member-card">
                <div className="member-info">
                  <h3>{party.party_name}</h3>
                  {party.leader_name && <p>순장: {party.leader_name}</p>}
                  {party.members && <p>순원: {party.members}</p>}
                  <small>등록일: {new Date(party.created_at).toLocaleDateString()}</small>
                </div>
                <div className="member-actions">
                  <button onClick={() => handleDelete(party.id)} className="btn btn-delete">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// 부서 관리 컴포넌트
function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ department_name: '', leader_id: '', member_ids: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchMembers();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/departments`);
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('부서 목록 조회 오류:', error);
      alert('부서 목록을 가져올 수 없습니다.');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/members`);
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('성도 목록 조회 오류:', error);
      setMembers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberToggle = (memberId) => {
    setFormData(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(memberId)
        ? prev.member_ids.filter(id => id !== memberId)
        : [...prev.member_ids, memberId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department_name.trim()) {
      alert('부서명을 입력해주세요.');
      return;
    }

    try {
      await axios.post(`${API_URL}/departments`, formData);
      alert('부서가 등록되었습니다.');
      setFormData({ department_name: '', leader_id: '', member_ids: [] });
      fetchDepartments();
    } catch (error) {
      console.error('부서 등록 오류:', error);
      alert('등록에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 부서를 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_URL}/departments/${id}`);
      alert('부서가 삭제되었습니다.');
      fetchDepartments();
    } catch (error) {
      console.error('부서 삭제 오류:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div>
      <section className="form-section">
        <h2>새 부서 등록</h2>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>부서명 *</label>
            <input type="text" name="department_name" value={formData.department_name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>부서장 선택</label>
            <select name="leader_id" value={formData.leader_id} onChange={handleInputChange}>
              <option value="">선택 안 함</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>부서원 선택</label>
            <div className="checkbox-list">
              {members.map(member => (
                <label key={member.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.member_ids.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                  />
                  {member.name} ({member.phone})
                </label>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">등록</button>
          </div>
        </form>
      </section>

      <section className="list-section">
        <h2>부서 목록</h2>
        {loading ? <p>로딩 중...</p> : departments.length === 0 ? <p>등록된 부서가 없습니다.</p> : (
          <div className="members-list">
            {departments.map(department => (
              <div key={department.id} className="member-card">
                <div className="member-info">
                  <h3>{department.department_name}</h3>
                  {department.leader_name && <p>부서장: {department.leader_name}</p>}
                  {department.members && <p>부서원: {department.members}</p>}
                  <small>등록일: {new Date(department.created_at).toLocaleDateString()}</small>
                </div>
                <div className="member-actions">
                  <button onClick={() => handleDelete(department.id)} className="btn btn-delete">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;