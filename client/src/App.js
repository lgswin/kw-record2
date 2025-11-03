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
    birth_date: '', baptized_type: '', baptism_date: '', registration_date: '',
    dismissal_date: '', deceased: false, faith_head: false, english_name: '',
    infant_baptism: false, email: '', occupation: '', work_phone: '',
    residence_start_date: '', previous_address: '', previous_church: '', previous_office: '',
    baptism_church: '', baptism_year: '', baptism_pastor: '', education: '',
    career: '', faith_life: '', marriage_anniversary: '', stay_period: '',
    specialty: '', service_history: '',
    office_ids: [], family_ids: [], party_ids: [], department_ids: []
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // 폼 표시 여부 (초기값: 숨김)
  const [searchInputs, setSearchInputs] = useState({
    office: '', family: '', party: '', department: ''
  });
  const [showDropdowns, setShowDropdowns] = useState({
    office: false, family: false, party: false, department: false
  });
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchMembers();
    fetchOffices();
    fetchFamilies();
    fetchParties();
    fetchDepartments();
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowDropdowns({ office: false, family: false, party: false, department: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
      setOffices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('직분 목록 조회 오류:', error);
      setOffices([]);
    }
  };

  const fetchFamilies = async () => {
    try {
      const response = await axios.get(`${API_URL}/families`);
      setFamilies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('가족 목록 조회 오류:', error);
      setFamilies([]);
    }
  };

  const fetchParties = async () => {
    try {
      const response = await axios.get(`${API_URL}/parties`);
      setParties(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('순모임 목록 조회 오류:', error);
      setParties([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_URL}/departments`);
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('부서 목록 조회 오류:', error);
      setDepartments([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const handleSearchInput = (type, value) => {
    setSearchInputs(prev => ({ ...prev, [type]: value }));
    setShowDropdowns(prev => ({ ...prev, [type]: value.length > 0 }));
  };

  const handleSelectItem = (type, item) => {
    const nameMap = {
      office: 'office_ids',
      family: 'family_ids',
      party: 'party_ids',
      department: 'department_ids'
    };
    const name = nameMap[type];
    
    setFormData(prev => {
      const currentIds = prev[name] || [];
      if (!currentIds.includes(item.id)) {
        return {
          ...prev,
          [name]: [...currentIds, item.id]
        };
      }
      return prev;
    });
    
    setSearchInputs(prev => ({ ...prev, [type]: '' }));
    setShowDropdowns(prev => ({ ...prev, [type]: false }));
  };

  const handleRemoveItem = (type, itemId) => {
    const nameMap = {
      office: 'office_ids',
      family: 'family_ids',
      party: 'party_ids',
      department: 'department_ids'
    };
    const name = nameMap[type];
    
    setFormData(prev => ({
      ...prev,
      [name]: (prev[name] || []).filter(id => id !== itemId)
    }));
  };

  const getFilteredItems = (type) => {
    const dataMap = {
      office: { data: offices, key: 'office_name' },
      family: { data: families, key: 'family_name' },
      party: { data: parties, key: 'party_name' },
      department: { data: departments, key: 'department_name' }
    };
    
    const { data, key } = dataMap[type];
    const searchTerm = searchInputs[type].toLowerCase();
    const selectedIds = formData[`${type}_ids`] || [];
    
    if (!searchTerm) return [];
    
    return (Array.isArray(data) ? data : []).filter(item => {
      const name = item[key] || '';
      return name.toLowerCase().includes(searchTerm) && !selectedIds.includes(item.id);
    });
  };

  const getSelectedItems = (type) => {
    const dataMap = {
      office: { data: offices },
      family: { data: families },
      party: { data: parties },
      department: { data: departments }
    };
    
    const { data } = dataMap[type];
    const selectedIds = formData[`${type}_ids`] || [];
    
    return (Array.isArray(data) ? data : []).filter(item => selectedIds.includes(item.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('이름과 전화번호는 필수입니다.');
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address || null,
        gender: formData.gender || null,
        birth_date: formData.birth_date || null,
        baptized: formData.baptized_type !== '' && formData.baptized_type !== '세례 안받음',
        baptized_type: formData.baptized_type || null,
        baptism_date: formData.baptized_type !== '' && formData.baptized_type !== '세례 안받음' ? (formData.baptism_date || null) : null,
        registration_date: formData.registration_date || null,
        dismissal_date: formData.dismissal_date || null,
        deceased: formData.deceased || false,
        faith_head: formData.faith_head || null,
        english_name: formData.english_name || null,
        infant_baptism: formData.infant_baptism || false,
        email: formData.email || null,
        occupation: formData.occupation || null,
        work_phone: formData.work_phone || null,
        residence_start_date: formData.residence_start_date || null,
        previous_address: formData.previous_address || null,
        previous_church: formData.previous_church || null,
        previous_office: formData.previous_office || null,
        baptism_church: formData.baptism_church || null,
        baptism_year: formData.baptism_year || null,
        baptism_pastor: formData.baptism_pastor || null,
        education: formData.education || null,
        career: formData.career || null,
        faith_life: formData.faith_life || null,
        marriage_anniversary: formData.marriage_anniversary || null,
        stay_period: formData.stay_period || null,
        specialty: formData.specialty || null,
        service_history: formData.service_history || null,
        office_ids: formData.office_ids || [],
        family_ids: formData.family_ids || [],
        party_ids: formData.party_ids || [],
        department_ids: formData.department_ids || []
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
        birth_date: '', baptized_type: '', baptism_date: '', registration_date: '',
        dismissal_date: '', deceased: false, faith_head: '', english_name: '',
        infant_baptism: false, email: '', occupation: '', work_phone: '',
        residence_start_date: '', previous_address: '', previous_church: '', previous_office: '',
        baptism_church: '', baptism_year: '', baptism_pastor: '', education: '',
        career: '', faith_life: '', marriage_anniversary: '', stay_period: '',
        specialty: '', service_history: '',
        office_ids: [], family_ids: [], party_ids: [], department_ids: []
      });
      fetchMembers();
      setShowForm(false); // 저장 후 폼 숨기기
    } catch (error) {
      console.error('성도 저장 오류:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // 날짜 문자열을 yyyy-MM-dd 형식으로 변환하는 헬퍼 함수
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // ISO 형식 (2020-01-01T05:00:00.000Z) 또는 다른 형식을 yyyy-MM-dd로 변환
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name || '',
      phone: member.phone || '',
      address: member.address || '',
      gender: member.gender || '',
      birth_date: formatDateForInput(member.birth_date),
      baptized_type: member.baptized_type || (member.baptized ? '세례' : '세례 안받음'),
      baptism_date: formatDateForInput(member.baptism_date),
      registration_date: formatDateForInput(member.registration_date),
      dismissal_date: formatDateForInput(member.dismissal_date),
      deceased: member.deceased || false,
      faith_head: member.faith_head ? String(member.faith_head) : '',
      english_name: member.english_name || '',
      infant_baptism: member.infant_baptism || false,
      email: member.email || '',
      occupation: member.occupation || '',
      work_phone: member.work_phone || '',
      residence_start_date: formatDateForInput(member.residence_start_date),
      previous_address: member.previous_address || '',
      previous_church: member.previous_church || '',
      previous_office: member.previous_office || '',
      baptism_church: member.baptism_church || '',
      baptism_year: member.baptism_year || '',
      baptism_pastor: member.baptism_pastor || '',
      education: member.education || '',
      career: member.career || '',
      faith_life: member.faith_life || '',
      marriage_anniversary: formatDateForInput(member.marriage_anniversary),
      stay_period: member.stay_period || '',
      specialty: member.specialty || '',
      service_history: member.service_history || '',
      office_ids: member.offices ? member.offices.map(o => o.id) : [],
      family_ids: member.families ? member.families.map(f => f.id) : [],
      party_ids: member.parties ? member.parties.map(p => p.id) : [],
      department_ids: member.departments ? member.departments.map(d => d.id) : []
    });
    setEditingId(member.id);
    setSearchInputs({ office: '', family: '', party: '', department: '' });
    setShowDropdowns({ office: false, family: false, party: false, department: false });
    
    // 폼이 숨겨져 있으면 표시
    setShowForm(true);
    
    // 폼 섹션으로 스크롤 이동
    setTimeout(() => {
      const formSection = document.querySelector('.form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: '', phone: '', address: '', gender: '',
      birth_date: '', baptized_type: '', baptism_date: '', registration_date: '',
      dismissal_date: '', deceased: false, faith_head: false, english_name: '',
      infant_baptism: false, email: '', occupation: '', work_phone: '',
      residence_start_date: '', previous_address: '', previous_church: '', previous_office: '',
      baptism_church: '', baptism_year: '', baptism_pastor: '', education: '',
      career: '', faith_life: '', marriage_anniversary: '', stay_period: '',
      specialty: '', service_history: '',
      office_ids: [], family_ids: [], party_ids: [], department_ids: []
    });
    setEditingId(null);
    setSearchInputs({ office: '', family: '', party: '', department: '' });
    setShowDropdowns({ office: false, family: false, party: false, department: false });
    setShowForm(false); // 취소 시 폼 숨기기
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{editingId ? '성도 정보 수정' : '새 성도 등록'}</h2>
        <button 
          type="button"
          onClick={() => setShowForm(prev => !prev)}
          className="btn btn-secondary"
          style={{ minWidth: '100px' }}
        >
          {showForm ? '숨기기' : '보이기'}
        </button>
      </div>
      {showForm && (
      <section className="form-section">
        <form onSubmit={handleSubmit} className="member-form">
          {/* 기본 정보 */}
          <div className="form-subsection">
            <h3>기본 정보</h3>
            <div className="form-row form-row-5">
              <div className="form-group">
                <label>이름 *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>영문이름</label>
                <input type="text" name="english_name" value={formData.english_name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>전화번호 *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>이메일</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>생년월일</label>
                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-row form-row-address">
              <div className="form-group form-group-address">
                <label>주소</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>거주시작일</label>
                <input type="date" name="residence_start_date" value={formData.residence_start_date} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>교회등록일</label>
                <input type="date" name="registration_date" value={formData.registration_date} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="form-subsection">
            <h3>상세 정보</h3>
            <div className="form-row form-row-5">
              <div className="form-group">
                <label>직업</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>직장번호</label>
                <input type="tel" name="work_phone" value={formData.work_phone} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>결혼기념일</label>
                <input type="date" name="marriage_anniversary" value={formData.marriage_anniversary} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>전 거주지</label>
                <input type="text" name="previous_address" value={formData.previous_address} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>체류예정기간</label>
                <input type="text" name="stay_period" value={formData.stay_period} onChange={handleInputChange} placeholder="예: 2년" />
              </div>
            </div>
            <div className="form-row form-row-4">
              <div className="form-group">
                <label>학력</label>
                <input type="text" name="education" value={formData.education} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>사회경력</label>
                <input type="text" name="career" value={formData.career} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>특기</label>
                <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>봉사경력</label>
                <input type="text" name="service_history" value={formData.service_history} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* 신앙 정보 */}
          <div className="form-subsection">
            <h3>신앙 정보</h3>
            <div className="form-row form-row-5">
              <div className="form-group">
                <label>세례 여부</label>
                <select name="baptized_type" value={formData.baptized_type} onChange={handleInputChange}>
                  <option value="">선택</option>
                  <option value="유아세례">유아세례</option>
                  <option value="입교">입교</option>
                  <option value="세례">세례</option>
                  <option value="세례 안받음">세례 안받음</option>
                </select>
              </div>
              <div className="form-group">
                <label>유아세례 여부</label>
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    name="infant_baptism"
                    checked={formData.infant_baptism}
                    onChange={(e) => setFormData(prev => ({ ...prev, infant_baptism: e.target.checked }))}
                    className="checkbox-large"
                    id="infant_baptism"
                  />
                  <label htmlFor="infant_baptism" className="checkbox-label-large">
                    {formData.infant_baptism ? '예' : '아니오'}
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>세례교회</label>
                <input type="text" name="baptism_church" value={formData.baptism_church} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>세례년도</label>
                <input type="number" name="baptism_year" value={formData.baptism_year} onChange={handleInputChange} min="1900" max="2100" />
              </div>
              <div className="form-group">
                <label>세례 목사</label>
                <input type="text" name="baptism_pastor" value={formData.baptism_pastor} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-row form-row-4">
              <div className="form-group">
                <label>섬기던교회</label>
                <input type="text" name="previous_church" value={formData.previous_church} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>전교회직분</label>
                <input type="text" name="previous_office" value={formData.previous_office} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>신앙생활시작</label>
                <input type="text" name="faith_life" value={formData.faith_life} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>신앙세대주</label>
                <input type="text" name="faith_head" value={formData.faith_head} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* 관계 정보 */}
          <div className="form-subsection">
            <h3>관계 정보</h3>
            <div className="relationship-grid">
              {/* 직분 */}
              <div className="relationship-item">
                <label className="relationship-label">직분</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    placeholder="직분을 입력하세요..."
                    value={searchInputs.office}
                    onChange={(e) => handleSearchInput('office', e.target.value)}
                    onFocus={() => searchInputs.office && setShowDropdowns(prev => ({ ...prev, office: true }))}
                    className="autocomplete-input"
                  />
                  {showDropdowns.office && getFilteredItems('office').length > 0 && (
                    <div className="autocomplete-dropdown">
                      {getFilteredItems('office').map(item => (
                        <div
                          key={item.id}
                          className="autocomplete-item"
                          onClick={() => handleSelectItem('office', item)}
                        >
                          {item.office_name}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="selected-tags">
                    {getSelectedItems('office').map(item => (
                      <span key={item.id} className="tag">
                        {item.office_name}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemoveItem('office', item.id)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 가족 */}
              <div className="relationship-item">
                <label className="relationship-label">가족</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    placeholder="가족을 입력하세요..."
                    value={searchInputs.family}
                    onChange={(e) => handleSearchInput('family', e.target.value)}
                    onFocus={() => searchInputs.family && setShowDropdowns(prev => ({ ...prev, family: true }))}
                    className="autocomplete-input"
                  />
                  {showDropdowns.family && getFilteredItems('family').length > 0 && (
                    <div className="autocomplete-dropdown">
                      {getFilteredItems('family').map(item => (
                        <div
                          key={item.id}
                          className="autocomplete-item"
                          onClick={() => handleSelectItem('family', item)}
                        >
                          {item.family_name}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="selected-tags">
                    {getSelectedItems('family').map(item => (
                      <span key={item.id} className="tag">
                        {item.family_name}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemoveItem('family', item.id)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 순모임 */}
              <div className="relationship-item">
                <label className="relationship-label">순모임</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    placeholder="순모임을 입력하세요..."
                    value={searchInputs.party}
                    onChange={(e) => handleSearchInput('party', e.target.value)}
                    onFocus={() => searchInputs.party && setShowDropdowns(prev => ({ ...prev, party: true }))}
                    className="autocomplete-input"
                  />
                  {showDropdowns.party && getFilteredItems('party').length > 0 && (
                    <div className="autocomplete-dropdown">
                      {getFilteredItems('party').map(item => (
                        <div
                          key={item.id}
                          className="autocomplete-item"
                          onClick={() => handleSelectItem('party', item)}
                        >
                          {item.party_name}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="selected-tags">
                    {getSelectedItems('party').map(item => (
                      <span key={item.id} className="tag">
                        {item.party_name}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemoveItem('party', item.id)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 부서 */}
              <div className="relationship-item">
                <label className="relationship-label">부서</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    placeholder="부서를 입력하세요..."
                    value={searchInputs.department}
                    onChange={(e) => handleSearchInput('department', e.target.value)}
                    onFocus={() => searchInputs.department && setShowDropdowns(prev => ({ ...prev, department: true }))}
                    className="autocomplete-input"
                  />
                  {showDropdowns.department && getFilteredItems('department').length > 0 && (
                    <div className="autocomplete-dropdown">
                      {getFilteredItems('department').map(item => (
                        <div
                          key={item.id}
                          className="autocomplete-item"
                          onClick={() => handleSelectItem('department', item)}
                        >
                          {item.department_name}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="selected-tags">
                    {getSelectedItems('department').map(item => (
                      <span key={item.id} className="tag">
                        {item.department_name}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemoveItem('department', item.id)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? '수정' : '등록'}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">취소</button>}
          </div>
        </form>
      </section>
      )}

      <section className="list-section">
        <div className="list-header">
          <h2>성도 목록</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="이름, 전화번호, 주소로 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        {(() => {
          const filteredMembers = members.filter(member => {
            if (!searchKeyword.trim()) return true;
            const keyword = searchKeyword.toLowerCase();
            const name = (member.name || '').toLowerCase();
            const phone = (member.phone || '').toLowerCase();
            const address = (member.address || '').toLowerCase();
            const offices = member.offices ? member.offices.map(o => o.office_name).join(' ').toLowerCase() : '';
            const families = member.families ? member.families.map(f => f.family_name).join(' ').toLowerCase() : '';
            const parties = member.parties ? member.parties.map(p => p.party_name).join(' ').toLowerCase() : '';
            const departments = member.departments ? member.departments.map(d => d.department_name).join(' ').toLowerCase() : '';
            
            return name.includes(keyword) || 
                   phone.includes(keyword) || 
                   address.includes(keyword) ||
                   offices.includes(keyword) ||
                   families.includes(keyword) ||
                   parties.includes(keyword) ||
                   departments.includes(keyword);
          });

          if (loading) {
            return <p>로딩 중...</p>;
          } else if (filteredMembers.length === 0) {
            return <p>{searchKeyword ? '검색 결과가 없습니다.' : '등록된 성도가 없습니다.'}</p>;
          } else {
            return (
              <div className="members-table-container">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>전화번호</th>
                      <th>주소</th>
                      <th>성별</th>
                      <th>생년월일</th>
                      <th>직분</th>
                      <th>가족</th>
                      <th>순모임</th>
                      <th>부서</th>
                      <th>등록일</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(member => (
                      <tr 
                        key={member.id}
                        onClick={() => handleEdit(member)}
                        className="member-row-clickable"
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{member.name}</td>
                        <td>{member.phone}</td>
                        <td>{member.address || '-'}</td>
                        <td>{member.gender === 'M' ? '남성' : member.gender === 'F' ? '여성' : '-'}</td>
                        <td>{member.birth_date ? new Date(member.birth_date).toLocaleDateString() : '-'}</td>
                        <td>{member.offices && member.offices.length > 0 ? member.offices.map(o => o.office_name).join(', ') : '-'}</td>
                        <td>{member.families && member.families.length > 0 ? member.families.map(f => f.family_name).join(', ') : '-'}</td>
                        <td>{member.parties && member.parties.length > 0 ? member.parties.map(p => p.party_name).join(', ') : '-'}</td>
                        <td>{member.departments && member.departments.length > 0 ? member.departments.map(d => d.department_name).join(', ') : '-'}</td>
                        <td>{new Date(member.created_at).toLocaleDateString()}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="member-actions">
                            <button onClick={() => handleEdit(member)} className="btn btn-edit">수정</button>
                            <button onClick={() => handleDelete(member.id)} className="btn btn-delete">삭제</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        })()}
        {searchKeyword && (
          <div className="search-result-info">
            검색 결과: {members.filter(m => {
              const keyword = searchKeyword.toLowerCase();
              const name = (m.name || '').toLowerCase();
              const phone = (m.phone || '').toLowerCase();
              const address = (m.address || '').toLowerCase();
              const offices = m.offices ? m.offices.map(o => o.office_name).join(' ').toLowerCase() : '';
              const families = m.families ? m.families.map(f => f.family_name).join(' ').toLowerCase() : '';
              const parties = m.parties ? m.parties.map(p => p.party_name).join(' ').toLowerCase() : '';
              const departments = m.departments ? m.departments.map(d => d.department_name).join(' ').toLowerCase() : '';
              return name.includes(keyword) || phone.includes(keyword) || address.includes(keyword) ||
                     offices.includes(keyword) || families.includes(keyword) || parties.includes(keyword) || departments.includes(keyword);
            }).length}명 / 전체 {members.length}명
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
  const [memberSearchInput, setMemberSearchInput] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [familySearchKeyword, setFamilySearchKeyword] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // 폼 표시 여부 (초기값: 숨김)

  useEffect(() => {
    fetchFamilies();
    fetchMembers();
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowMemberDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleMemberSearchInput = (value) => {
    setMemberSearchInput(value);
    setShowMemberDropdown(value.length > 0);
  };

  const handleSelectMember = (member) => {
    setFormData(prev => {
      if (!prev.member_ids.includes(member.id)) {
        return {
          ...prev,
          member_ids: [...prev.member_ids, member.id]
        };
      }
      return prev;
    });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
  };

  const handleRemoveMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      member_ids: prev.member_ids.filter(id => id !== memberId)
    }));
  };

  const getFilteredMembers = () => {
    if (!memberSearchInput.trim()) return [];
    const keyword = memberSearchInput.toLowerCase();
    const selectedIds = formData.member_ids || [];
    
    return (Array.isArray(members) ? members : []).filter(member => {
      const name = (member.name || '').toLowerCase();
      const phone = (member.phone || '').toLowerCase();
      return (name.includes(keyword) || phone.includes(keyword)) && !selectedIds.includes(member.id);
    });
  };

  const getSelectedMembers = () => {
    const selectedIds = formData.member_ids || [];
    return (Array.isArray(members) ? members : []).filter(member => selectedIds.includes(member.id));
  };

  const handleEdit = (family) => {
    setEditingId(family.id);
    setFormData({
      family_name: family.family_name,
      member_ids: family.members ? 
        (Array.isArray(members) ? members : [])
          .filter(m => family.members.includes(m.name))
          .map(m => m.id) : []
    });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
    
    // 폼이 숨겨져 있으면 표시
    setShowForm(true);
    
    // 폼 섹션으로 스크롤 이동
    setTimeout(() => {
      const formSection = document.querySelector('.form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ family_name: '', member_ids: [] });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
    setShowForm(false); // 취소 시 폼 숨기기
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.family_name.trim()) {
      alert('가족명을 입력해주세요.');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/families/${editingId}`, formData);
        alert('가족 정보가 수정되었습니다.');
      } else {
        await axios.post(`${API_URL}/families`, formData);
        alert('가족이 등록되었습니다.');
      }
      setFormData({ family_name: '', member_ids: [] });
      setMemberSearchInput('');
      setShowMemberDropdown(false);
      setEditingId(null);
      fetchFamilies();
      setShowForm(false); // 저장 후 폼 숨기기
    } catch (error) {
      console.error(editingId ? '가족 수정 오류:' : '가족 등록 오류:', error);
      alert(editingId ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{editingId ? '가족 정보 수정' : '새 가족 등록'}</h2>
        <button 
          type="button"
          onClick={() => setShowForm(prev => !prev)}
          className="btn btn-secondary"
          style={{ minWidth: '100px' }}
        >
          {showForm ? '숨기기' : '보이기'}
        </button>
      </div>
      {showForm && (
      <section className="form-section">
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>가족명 *</label>
            <input type="text" name="family_name" value={formData.family_name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>가족 구성원 선택</label>
            <div className="autocomplete-container">
              <input
                type="text"
                placeholder="성도 이름 또는 전화번호로 검색..."
                value={memberSearchInput}
                onChange={(e) => handleMemberSearchInput(e.target.value)}
                onFocus={() => memberSearchInput && setShowMemberDropdown(true)}
                className="autocomplete-input"
              />
              {showMemberDropdown && getFilteredMembers().length > 0 && (
                <div className="autocomplete-dropdown">
                  {getFilteredMembers().map(member => (
                    <div
                      key={member.id}
                      className="autocomplete-item"
                      onClick={() => handleSelectMember(member)}
                    >
                      {member.name} ({member.phone})
                    </div>
                  ))}
                </div>
              )}
              <div className="selected-tags">
                {getSelectedMembers().map(member => (
                  <span key={member.id} className="tag">
                    {member.name} ({member.phone})
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? '수정' : '등록'}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">취소</button>}
          </div>
        </form>
      </section>
      )}

      <section className="list-section">
        <div className="list-header">
          <h2>가족 목록</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="가족명 또는 구성원 이름으로 검색..."
              value={familySearchKeyword}
              onChange={(e) => setFamilySearchKeyword(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        {(() => {
          const filteredFamilies = families.filter(family => {
            if (!familySearchKeyword.trim()) return true;
            const keyword = familySearchKeyword.toLowerCase();
            const familyName = (family.family_name || '').toLowerCase();
            const members = (family.members || '').toLowerCase();
            
            return familyName.includes(keyword) || members.includes(keyword);
          });

          if (loading) {
            return <p>로딩 중...</p>;
          } else if (filteredFamilies.length === 0) {
            return <p>{familySearchKeyword ? '검색 결과가 없습니다.' : '등록된 가족이 없습니다.'}</p>;
          } else {
            return (
              <div className="members-table-container">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>가족명</th>
                      <th>구성원</th>
                      <th>등록일</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFamilies.map(family => (
                      <tr 
                        key={family.id}
                        onClick={() => handleEdit(family)}
                        className="member-row-clickable"
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{family.family_name}</td>
                        <td>{family.members || '-'}</td>
                        <td>{new Date(family.created_at).toLocaleDateString()}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="member-actions">
                            <button onClick={() => handleEdit(family)} className="btn btn-edit">수정</button>
                            <button onClick={() => handleDelete(family.id)} className="btn btn-delete">삭제</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        })()}
        {familySearchKeyword && (
          <div className="search-result-info">
            검색 결과: {families.filter(f => {
              const keyword = familySearchKeyword.toLowerCase();
              const familyName = (f.family_name || '').toLowerCase();
              const members = (f.members || '').toLowerCase();
              return familyName.includes(keyword) || members.includes(keyword);
            }).length}개 / 전체 {families.length}개
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
  const [memberSearchInput, setMemberSearchInput] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [partySearchKeyword, setPartySearchKeyword] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // 폼 표시 여부 (초기값: 숨김)

  useEffect(() => {
    fetchParties();
    fetchMembers();
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowMemberDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleMemberSearchInput = (value) => {
    setMemberSearchInput(value);
    setShowMemberDropdown(value.length > 0);
  };

  const handleSelectMember = (member) => {
    setFormData(prev => {
      if (!prev.member_ids.includes(member.id)) {
        return {
          ...prev,
          member_ids: [...prev.member_ids, member.id]
        };
      }
      return prev;
    });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
  };

  const handleRemoveMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      member_ids: prev.member_ids.filter(id => id !== memberId)
    }));
  };

  const getFilteredMembers = () => {
    if (!memberSearchInput.trim()) return [];
    const keyword = memberSearchInput.toLowerCase();
    const selectedIds = formData.member_ids || [];
    
    return (Array.isArray(members) ? members : []).filter(member => {
      const name = (member.name || '').toLowerCase();
      const phone = (member.phone || '').toLowerCase();
      return (name.includes(keyword) || phone.includes(keyword)) && !selectedIds.includes(member.id);
    });
  };

  const getSelectedMembers = () => {
    const selectedIds = formData.member_ids || [];
    return (Array.isArray(members) ? members : []).filter(member => selectedIds.includes(member.id));
  };

  const handleEdit = (party) => {
    setEditingId(party.id);
    // members 문자열을 파싱하여 member_ids 추출
    const memberNames = party.members ? party.members.split(',').map(m => m.trim()) : [];
    const partyMemberIds = (Array.isArray(members) ? members : [])
      .filter(m => memberNames.includes(m.name))
      .map(m => m.id);
    
    setFormData({
      party_name: party.party_name,
      leader_id: party.leader_id || '',
      member_ids: partyMemberIds
    });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
    
    // 폼이 숨겨져 있으면 표시
    setShowForm(true);
    
    // 폼 섹션으로 스크롤 이동
    setTimeout(() => {
      const formSection = document.querySelector('.form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ party_name: '', leader_id: '', member_ids: [] });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
    setShowForm(false); // 취소 시 폼 숨기기
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.party_name.trim()) {
      alert('순명을 입력해주세요.');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/parties/${editingId}`, formData);
        alert('순모임 정보가 수정되었습니다.');
      } else {
        await axios.post(`${API_URL}/parties`, formData);
        alert('순모임이 등록되었습니다.');
      }
      setFormData({ party_name: '', leader_id: '', member_ids: [] });
      setMemberSearchInput('');
      setShowMemberDropdown(false);
      setEditingId(null);
      fetchParties();
      setShowForm(false); // 저장 후 폼 숨기기
    } catch (error) {
      console.error(editingId ? '순모임 수정 오류:' : '순모임 등록 오류:', error);
      alert(editingId ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{editingId ? '순모임 정보 수정' : '새 순모임 등록'}</h2>
        <button 
          type="button"
          onClick={() => setShowForm(prev => !prev)}
          className="btn btn-secondary"
          style={{ minWidth: '100px' }}
        >
          {showForm ? '숨기기' : '보이기'}
        </button>
      </div>
      {showForm && (
      <section className="form-section">
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
            <div className="autocomplete-container">
              <input
                type="text"
                placeholder="성도 이름 또는 전화번호로 검색..."
                value={memberSearchInput}
                onChange={(e) => handleMemberSearchInput(e.target.value)}
                onFocus={() => memberSearchInput && setShowMemberDropdown(true)}
                className="autocomplete-input"
              />
              {showMemberDropdown && getFilteredMembers().length > 0 && (
                <div className="autocomplete-dropdown">
                  {getFilteredMembers().map(member => (
                    <div
                      key={member.id}
                      className="autocomplete-item"
                      onClick={() => handleSelectMember(member)}
                    >
                      {member.name} ({member.phone})
                    </div>
                  ))}
                </div>
              )}
              <div className="selected-tags">
                {getSelectedMembers().map(member => (
                  <span key={member.id} className="tag">
                    {member.name} ({member.phone})
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? '수정' : '등록'}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">취소</button>}
          </div>
        </form>
      </section>
      )}

      <section className="list-section">
        <div className="list-header">
          <h2>순모임 목록</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="순명 또는 순원 이름으로 검색..."
              value={partySearchKeyword}
              onChange={(e) => setPartySearchKeyword(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        {(() => {
          const filteredParties = parties.filter(party => {
            if (!partySearchKeyword.trim()) return true;
            const keyword = partySearchKeyword.toLowerCase();
            const partyName = (party.party_name || '').toLowerCase();
            const leaderName = (party.leader_name || '').toLowerCase();
            const members = (party.members || '').toLowerCase();
            
            return partyName.includes(keyword) || leaderName.includes(keyword) || members.includes(keyword);
          });

          if (loading) {
            return <p>로딩 중...</p>;
          } else if (filteredParties.length === 0) {
            return <p>{partySearchKeyword ? '검색 결과가 없습니다.' : '등록된 순모임이 없습니다.'}</p>;
          } else {
            return (
              <div className="members-table-container">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>순모임명</th>
                      <th>순장</th>
                      <th>순원</th>
                      <th>등록일</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParties.map(party => (
                      <tr 
                        key={party.id}
                        onClick={() => handleEdit(party)}
                        className="member-row-clickable"
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{party.party_name}</td>
                        <td>{party.leader_name || '-'}</td>
                        <td>{party.members || '-'}</td>
                        <td>{new Date(party.created_at).toLocaleDateString()}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="member-actions">
                            <button onClick={() => handleEdit(party)} className="btn btn-edit">수정</button>
                            <button onClick={() => handleDelete(party.id)} className="btn btn-delete">삭제</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        })()}
        {partySearchKeyword && (
          <div className="search-result-info">
            검색 결과: {parties.filter(p => {
              const keyword = partySearchKeyword.toLowerCase();
              const partyName = (p.party_name || '').toLowerCase();
              const leaderName = (p.leader_name || '').toLowerCase();
              const members = (p.members || '').toLowerCase();
              return partyName.includes(keyword) || leaderName.includes(keyword) || members.includes(keyword);
            }).length}개 / 전체 {parties.length}개
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
  const [formData, setFormData] = useState({ 
    department_name: '', 
    president_id: '', 
    vice_president_id: '', 
    secretary_id: '', 
    treasurer_id: '', 
    clerk_id: '', 
    member_ids: [] 
  });
  const [loading, setLoading] = useState(false);
  const [memberSearchInput, setMemberSearchInput] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [departmentSearchKeyword, setDepartmentSearchKeyword] = useState('');
  const [positionSearchInputs, setPositionSearchInputs] = useState({
    president: '', vice_president: '', secretary: '', treasurer: '', clerk: ''
  });
  const [showPositionDropdowns, setShowPositionDropdowns] = useState({
    president: false, vice_president: false, secretary: false, treasurer: false, clerk: false
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // 폼 표시 여부 (초기값: 숨김)

  useEffect(() => {
    fetchDepartments();
    fetchMembers();
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowMemberDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleMemberSearchInput = (value) => {
    setMemberSearchInput(value);
    setShowMemberDropdown(value.length > 0);
  };

  const handleSelectMember = (member) => {
    setFormData(prev => {
      if (!prev.member_ids.includes(member.id)) {
        return {
          ...prev,
          member_ids: [...prev.member_ids, member.id]
        };
      }
      return prev;
    });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
  };

  const handleRemoveMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      member_ids: prev.member_ids.filter(id => id !== memberId)
    }));
  };

  const getFilteredMembers = () => {
    if (!memberSearchInput.trim()) return [];
    const keyword = memberSearchInput.toLowerCase();
    const selectedIds = formData.member_ids || [];
    
    return (Array.isArray(members) ? members : []).filter(member => {
      const name = (member.name || '').toLowerCase();
      const phone = (member.phone || '').toLowerCase();
      return (name.includes(keyword) || phone.includes(keyword)) && !selectedIds.includes(member.id);
    });
  };

  const getSelectedMembers = () => {
    const selectedIds = formData.member_ids || [];
    return (Array.isArray(members) ? members : []).filter(member => selectedIds.includes(member.id));
  };

  const handlePositionSearchInput = (position, value) => {
    setPositionSearchInputs(prev => ({ ...prev, [position]: value }));
    setShowPositionDropdowns(prev => ({ ...prev, [position]: value.length > 0 }));
  };

  const handleSelectPosition = (position, member) => {
    const positionMap = {
      president: 'president_id',
      vice_president: 'vice_president_id',
      secretary: 'secretary_id',
      treasurer: 'treasurer_id',
      clerk: 'clerk_id'
    };
    const fieldName = positionMap[position];
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: member.id
    }));
    
    setPositionSearchInputs(prev => ({ ...prev, [position]: '' }));
    setShowPositionDropdowns(prev => ({ ...prev, [position]: false }));
  };

  const handleRemovePosition = (position) => {
    const positionMap = {
      president: 'president_id',
      vice_president: 'vice_president_id',
      secretary: 'secretary_id',
      treasurer: 'treasurer_id',
      clerk: 'clerk_id'
    };
    const fieldName = positionMap[position];
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  const getFilteredMembersForPosition = (position) => {
    const positionMap = {
      president: 'president_id',
      vice_president: 'vice_president_id',
      secretary: 'secretary_id',
      treasurer: 'treasurer_id',
      clerk: 'clerk_id'
    };
    const fieldName = positionMap[position];
    const selectedId = formData[fieldName] || '';
    
    if (!positionSearchInputs[position].trim()) return [];
    const keyword = positionSearchInputs[position].toLowerCase();
    
    return (Array.isArray(members) ? members : []).filter(member => {
      if (member.id === selectedId) return false; // 이미 선택된 사람 제외
      const name = (member.name || '').toLowerCase();
      const phone = (member.phone || '').toLowerCase();
      return (name.includes(keyword) || phone.includes(keyword));
    });
  };

  const getSelectedPositionMember = (position) => {
    const positionMap = {
      president: 'president_id',
      vice_president: 'vice_president_id',
      secretary: 'secretary_id',
      treasurer: 'treasurer_id',
      clerk: 'clerk_id'
    };
    const fieldName = positionMap[position];
    const selectedId = formData[fieldName];
    
    if (!selectedId) return null;
    return (Array.isArray(members) ? members : []).find(member => member.id === selectedId);
  };

  const handleEdit = (department) => {
    setEditingId(department.id);
    // members 문자열을 파싱하여 member_ids 추출
    const memberNames = department.members ? department.members.split(',').map(m => m.trim()) : [];
    const departmentMemberIds = (Array.isArray(members) ? members : [])
      .filter(m => memberNames.includes(m.name))
      .map(m => m.id);
    
    setFormData({
      department_name: department.department_name,
      president_id: department.president_id || '',
      vice_president_id: department.vice_president_id || '',
      secretary_id: department.secretary_id || '',
      treasurer_id: department.treasurer_id || '',
      clerk_id: department.clerk_id || '',
      member_ids: departmentMemberIds
    });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
    setPositionSearchInputs({ president: '', vice_president: '', secretary: '', treasurer: '', clerk: '' });
    setShowPositionDropdowns({ president: false, vice_president: false, secretary: false, treasurer: false, clerk: false });
    
    // 폼 섹션으로 스크롤 이동
    setTimeout(() => {
      const formSection = document.querySelector('.form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ 
      department_name: '', 
      president_id: '', 
      vice_president_id: '', 
      secretary_id: '', 
      treasurer_id: '', 
      clerk_id: '', 
      member_ids: [] 
    });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
    setPositionSearchInputs({ president: '', vice_president: '', secretary: '', treasurer: '', clerk: '' });
    setShowPositionDropdowns({ president: false, vice_president: false, secretary: false, treasurer: false, clerk: false });
    setShowForm(false); // 취소 시 폼 숨기기
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department_name.trim()) {
      alert('부서명을 입력해주세요.');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/departments/${editingId}`, formData);
        alert('부서 정보가 수정되었습니다.');
      } else {
        await axios.post(`${API_URL}/departments`, formData);
        alert('부서가 등록되었습니다.');
      }
      setFormData({ 
        department_name: '', 
        president_id: '', 
        vice_president_id: '', 
        secretary_id: '', 
        treasurer_id: '', 
        clerk_id: '', 
        member_ids: [] 
      });
      setMemberSearchInput('');
      setShowMemberDropdown(false);
      setPositionSearchInputs({ president: '', vice_president: '', secretary: '', treasurer: '', clerk: '' });
      setShowPositionDropdowns({ president: false, vice_president: false, secretary: false, treasurer: false, clerk: false });
      setEditingId(null);
      fetchDepartments();
    } catch (error) {
      console.error(editingId ? '부서 수정 오류:' : '부서 등록 오류:', error);
      alert(editingId ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{editingId ? '부서 정보 수정' : '새 부서 등록'}</h2>
        <button 
          type="button"
          onClick={() => setShowForm(prev => !prev)}
          className="btn btn-secondary"
          style={{ minWidth: '100px' }}
        >
          {showForm ? '숨기기' : '보이기'}
        </button>
      </div>
      {showForm && (
      <section className="form-section">
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>부서명 *</label>
            <input type="text" name="department_name" value={formData.department_name} onChange={handleInputChange} required />
          </div>
          {/* 직책별 선택 */}
          <div className="form-subsection">
            <h3>직책별 선택</h3>
            <div className="position-selection-grid">
              {/* 회장 */}
              <div className="form-group">
                <label>회장</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    placeholder="검색..."
                    value={positionSearchInputs.president}
                    onChange={(e) => handlePositionSearchInput('president', e.target.value)}
                    onFocus={() => positionSearchInputs.president && setShowPositionDropdowns(prev => ({ ...prev, president: true }))}
                    className="autocomplete-input"
                  />
                  {showPositionDropdowns.president && getFilteredMembersForPosition('president').length > 0 && (
                    <div className="autocomplete-dropdown">
                      {getFilteredMembersForPosition('president').map(member => (
                        <div
                          key={member.id}
                          className="autocomplete-item"
                          onClick={() => handleSelectPosition('president', member)}
                        >
                          {member.name} ({member.phone})
                        </div>
                      ))}
                    </div>
                  )}
                  {getSelectedPositionMember('president') && (
                    <div className="selected-position-member">
                      <span className="tag">
                        {getSelectedPositionMember('president').name}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemovePosition('president')}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 부회장 */}
              <div className="form-group">
                <label>부회장</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    placeholder="검색..."
                    value={positionSearchInputs.vice_president}
                    onChange={(e) => handlePositionSearchInput('vice_president', e.target.value)}
                    onFocus={() => positionSearchInputs.vice_president && setShowPositionDropdowns(prev => ({ ...prev, vice_president: true }))}
                    className="autocomplete-input"
                  />
                  {showPositionDropdowns.vice_president && getFilteredMembersForPosition('vice_president').length > 0 && (
                    <div className="autocomplete-dropdown">
                      {getFilteredMembersForPosition('vice_president').map(member => (
                        <div
                          key={member.id}
                          className="autocomplete-item"
                          onClick={() => handleSelectPosition('vice_president', member)}
                        >
                          {member.name} ({member.phone})
                        </div>
                      ))}
                    </div>
                  )}
                  {getSelectedPositionMember('vice_president') && (
                    <div className="selected-position-member">
                      <span className="tag">
                        {getSelectedPositionMember('vice_president').name}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemovePosition('vice_president')}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 총무 */}
              <div className="form-group">
                <label>총무</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    placeholder="검색..."
                    value={positionSearchInputs.secretary}
                    onChange={(e) => handlePositionSearchInput('secretary', e.target.value)}
                    onFocus={() => positionSearchInputs.secretary && setShowPositionDropdowns(prev => ({ ...prev, secretary: true }))}
                    className="autocomplete-input"
                  />
                  {showPositionDropdowns.secretary && getFilteredMembersForPosition('secretary').length > 0 && (
                    <div className="autocomplete-dropdown">
                      {getFilteredMembersForPosition('secretary').map(member => (
                        <div
                          key={member.id}
                          className="autocomplete-item"
                          onClick={() => handleSelectPosition('secretary', member)}
                        >
                          {member.name} ({member.phone})
                        </div>
                      ))}
                    </div>
                  )}
                  {getSelectedPositionMember('secretary') && (
                    <div className="selected-position-member">
                      <span className="tag">
                        {getSelectedPositionMember('secretary').name}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemovePosition('secretary')}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 회계 */}
              <div className="form-group">
                <label>회계</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    placeholder="검색..."
                    value={positionSearchInputs.treasurer}
                    onChange={(e) => handlePositionSearchInput('treasurer', e.target.value)}
                    onFocus={() => positionSearchInputs.treasurer && setShowPositionDropdowns(prev => ({ ...prev, treasurer: true }))}
                    className="autocomplete-input"
                  />
                  {showPositionDropdowns.treasurer && getFilteredMembersForPosition('treasurer').length > 0 && (
                    <div className="autocomplete-dropdown">
                      {getFilteredMembersForPosition('treasurer').map(member => (
                        <div
                          key={member.id}
                          className="autocomplete-item"
                          onClick={() => handleSelectPosition('treasurer', member)}
                        >
                          {member.name} ({member.phone})
                        </div>
                      ))}
                    </div>
                  )}
                  {getSelectedPositionMember('treasurer') && (
                    <div className="selected-position-member">
                      <span className="tag">
                        {getSelectedPositionMember('treasurer').name}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemovePosition('treasurer')}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 서기 */}
              <div className="form-group">
                <label>서기</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    placeholder="검색..."
                    value={positionSearchInputs.clerk}
                    onChange={(e) => handlePositionSearchInput('clerk', e.target.value)}
                    onFocus={() => positionSearchInputs.clerk && setShowPositionDropdowns(prev => ({ ...prev, clerk: true }))}
                    className="autocomplete-input"
                  />
                  {showPositionDropdowns.clerk && getFilteredMembersForPosition('clerk').length > 0 && (
                    <div className="autocomplete-dropdown">
                      {getFilteredMembersForPosition('clerk').map(member => (
                        <div
                          key={member.id}
                          className="autocomplete-item"
                          onClick={() => handleSelectPosition('clerk', member)}
                        >
                          {member.name} ({member.phone})
                        </div>
                      ))}
                    </div>
                  )}
                  {getSelectedPositionMember('clerk') && (
                    <div className="selected-position-member">
                      <span className="tag">
                        {getSelectedPositionMember('clerk').name}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemovePosition('clerk')}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>부서원 선택</label>
            <div className="autocomplete-container">
              <input
                type="text"
                placeholder="성도 이름 또는 전화번호로 검색..."
                value={memberSearchInput}
                onChange={(e) => handleMemberSearchInput(e.target.value)}
                onFocus={() => memberSearchInput && setShowMemberDropdown(true)}
                className="autocomplete-input"
              />
              {showMemberDropdown && getFilteredMembers().length > 0 && (
                <div className="autocomplete-dropdown">
                  {getFilteredMembers().map(member => (
                    <div
                      key={member.id}
                      className="autocomplete-item"
                      onClick={() => handleSelectMember(member)}
                    >
                      {member.name} ({member.phone})
                    </div>
                  ))}
                </div>
              )}
              <div className="selected-tags">
                {getSelectedMembers().map(member => (
                  <span key={member.id} className="tag">
                    {member.name} ({member.phone})
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? '수정' : '등록'}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">취소</button>}
          </div>
        </form>
      </section>
      )}

      <section className="list-section">
        <div className="list-header">
          <h2>부서 목록</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="부서명 또는 부서원 이름으로 검색..."
              value={departmentSearchKeyword}
              onChange={(e) => setDepartmentSearchKeyword(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        {(() => {
          const filteredDepartments = departments.filter(department => {
            if (!departmentSearchKeyword.trim()) return true;
            const keyword = departmentSearchKeyword.toLowerCase();
            const departmentName = (department.department_name || '').toLowerCase();
            const presidentName = (department.president_name || '').toLowerCase();
            const vicePresidentName = (department.vice_president_name || '').toLowerCase();
            const secretaryName = (department.secretary_name || '').toLowerCase();
            const treasurerName = (department.treasurer_name || '').toLowerCase();
            const clerkName = (department.clerk_name || '').toLowerCase();
            const members = (department.members || '').toLowerCase();
            
            return departmentName.includes(keyword) || 
                   presidentName.includes(keyword) ||
                   vicePresidentName.includes(keyword) ||
                   secretaryName.includes(keyword) ||
                   treasurerName.includes(keyword) ||
                   clerkName.includes(keyword) ||
                   members.includes(keyword);
          });

          if (loading) {
            return <p>로딩 중...</p>;
          } else if (filteredDepartments.length === 0) {
            return <p>{departmentSearchKeyword ? '검색 결과가 없습니다.' : '등록된 부서가 없습니다.'}</p>;
          } else {
            return (
              <div className="members-table-container">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>부서명</th>
                      <th>회장</th>
                      <th>부회장</th>
                      <th>총무</th>
                      <th>회계</th>
                      <th>서기</th>
                      <th>부서원</th>
                      <th>등록일</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.map(department => (
                      <tr 
                        key={department.id}
                        onClick={() => handleEdit(department)}
                        className="member-row-clickable"
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{department.department_name}</td>
                        <td>{department.president_name || '-'}</td>
                        <td>{department.vice_president_name || '-'}</td>
                        <td>{department.secretary_name || '-'}</td>
                        <td>{department.treasurer_name || '-'}</td>
                        <td>{department.clerk_name || '-'}</td>
                        <td>{department.members || '-'}</td>
                        <td>{new Date(department.created_at).toLocaleDateString()}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="member-actions">
                            <button onClick={() => handleEdit(department)} className="btn btn-edit">수정</button>
                            <button onClick={() => handleDelete(department.id)} className="btn btn-delete">삭제</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        })()}
        {departmentSearchKeyword && (
          <div className="search-result-info">
            검색 결과: {departments.filter(d => {
              const keyword = departmentSearchKeyword.toLowerCase();
              const departmentName = (d.department_name || '').toLowerCase();
              const presidentName = (d.president_name || '').toLowerCase();
              const vicePresidentName = (d.vice_president_name || '').toLowerCase();
              const secretaryName = (d.secretary_name || '').toLowerCase();
              const treasurerName = (d.treasurer_name || '').toLowerCase();
              const clerkName = (d.clerk_name || '').toLowerCase();
              const members = (d.members || '').toLowerCase();
              return departmentName.includes(keyword) || 
                     presidentName.includes(keyword) ||
                     vicePresidentName.includes(keyword) ||
                     secretaryName.includes(keyword) ||
                     treasurerName.includes(keyword) ||
                     clerkName.includes(keyword) ||
                     members.includes(keyword);
            }).length}개 / 전체 {departments.length}개
          </div>
        )}
      </section>
    </div>
  );
}

export default App;