import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // API 기본 URL
  const API_URL = 'http://20.63.25.94:5001/api';

  // 성도 목록 조회
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error('성도 목록 조회 오류:', error);
      alert('성도 목록을 가져올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 성도 목록 조회
  useEffect(() => {
    fetchMembers();
  }, []);

  // 폼 입력 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 성도 추가
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('이름과 전화번호를 모두 입력해주세요.');
      return;
    }

    try {
      if (editingId) {
        // 수정
        await axios.put(`${API_URL}/members/${editingId}`, formData);
        alert('성도 정보가 수정되었습니다.');
        setEditingId(null);
      } else {
        // 추가
        await axios.post(`${API_URL}/members`, formData);
        alert('새 성도가 추가되었습니다.');
      }
      
      setFormData({ name: '', phone: '' });
      fetchMembers();
    } catch (error) {
      console.error('성도 저장 오류:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // 성도 수정 모드로 전환
  const handleEdit = (member) => {
    setFormData({ name: member.name, phone: member.phone });
    setEditingId(member.id);
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setFormData({ name: '', phone: '' });
    setEditingId(null);
  };

  // 성도 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 성도를 삭제하시겠습니까?')) {
      return;
    }

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
    <div className="App">
      <header className="App-header">
        <h1>KW한인장로교회 성도 관리</h1>
      </header>
      
      <main className="container">
        {/* 성도 추가/수정 폼 */}
        <section className="form-section">
          <h2>{editingId ? '성도 정보 수정' : '새 성도 추가'}</h2>
          <form onSubmit={handleSubmit} className="member-form">
            <div className="form-group">
              <label htmlFor="name">이름:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="성도 이름을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">전화번호:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="전화번호를 입력하세요"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? '수정' : '추가'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                  취소
                </button>
              )}
            </div>
          </form>
        </section>

        {/* 성도 목록 */}
        <section className="list-section">
          <h2>성도 목록</h2>
          {loading ? (
            <p>로딩 중...</p>
          ) : members.length === 0 ? (
            <p>등록된 성도가 없습니다.</p>
          ) : (
            <div className="members-list">
              {members.map(member => (
                <div key={member.id} className="member-card">
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <p>{member.phone}</p>
                    <small>등록일: {new Date(member.created_at).toLocaleDateString()}</small>
                  </div>
                  <div className="member-actions">
                    <button 
                      onClick={() => handleEdit(member)}
                      className="btn btn-edit"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDelete(member.id)}
                      className="btn btn-delete"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;