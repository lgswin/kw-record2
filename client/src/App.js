import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// 개발 환경에서는 localhost 사용, 프로덕션에서는 상대 경로 사용
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5001/api');

// axios 기본 설정 (세션 쿠키를 위한 credentials)
axios.defaults.withCredentials = true;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    checkAuth(true); // 초기 로드
    
    // 주기적으로 세션 체크 (5분마다)
    const interval = setInterval(() => {
      checkAuth(false); // 주기적 체크는 탭 변경 안 함
    }, 5 * 60 * 1000); // 5분
    
    // 페이지 포커스 시 세션 체크 (모바일에서 앱으로 돌아올 때)
    const handleFocus = () => {
      checkAuth(false); // 포커스 시에도 탭 변경 안 함
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // checkAuth는 컴포넌트 내부 함수이므로 의존성에서 제외

  const checkAuth = async (isInitial = false) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true
      });
      if (response.data && response.data.user) {
        setUser(response.data.user);
        // 초기 로드 시에만 대시보드로 설정
        if (isInitial && isInitialLoad) {
          setActiveTab('dashboard');
          setIsInitialLoad(false);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      // 401 (Unauthorized) 오류만 로그아웃 처리
      if (error.response && error.response.status === 401) {
        setUser(null);
      }
      // 다른 오류는 무시 (네트워크 오류 등)
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      }, {
        withCredentials: true
      });
      setUser(response.data.user);
      setIsInitialLoad(false);
      // 로그인 성공 시 대시보드로 설정
      setActiveTab('dashboard');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || '로그인에 실패했습니다.' 
      };
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true
      });
      setUser(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        withCredentials: true
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || '비밀번호 변경에 실패했습니다.' 
      };
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <img 
            src="/logo.png" 
            alt="KW한인장로교회" 
            style={{ 
              height: '50px', 
              maxWidth: '300px',
              objectFit: 'contain'
            }} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.9em', opacity: 0.9 }}>
              {user.name || user.username} ({user.role === 'admin' ? '관리자' : '일반사용자'})
            </span>
            <button 
              onClick={() => setActiveTab('settings')}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
            >
              설정
            </button>
            <button 
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      
      <nav className="nav-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'nav-tab active' : 'nav-tab'}
          onClick={() => setActiveTab('dashboard')}
        >
          대시보드
        </button>
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
        <button 
          className={activeTab === 'organizations' ? 'nav-tab active' : 'nav-tab'}
          onClick={() => setActiveTab('organizations')}
        >
          조직 관리
        </button>
        <button 
          className={activeTab === 'attendance' ? 'nav-tab active' : 'nav-tab'}
          onClick={() => setActiveTab('attendance')}
        >
          출석부
        </button>
      </nav>

      <main className="container">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'settings' && <SettingsPage user={user} onPasswordChange={handlePasswordChange} />}
        {activeTab === 'members' && <MemberManagement />}
        {activeTab === 'families' && <FamilyManagement />}
        {activeTab === 'parties' && <PartyManagement />}
        {activeTab === 'departments' && <DepartmentManagement />}
        {activeTab === 'organizations' && <OrganizationManagement />}
        {activeTab === 'attendance' && <AttendanceManagement />}
      </main>
    </div>
  );
}

// 로그인 페이지 컴포넌트
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onLogin(username, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#2c3e50'
        }}>
          KW한인장로교회
        </h2>
        <h3 style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#666',
          fontWeight: 'normal'
        }}>
          관리 시스템 로그인
        </h3>
        
        {error && (
          <div style={{
            padding: '12px',
            background: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '0.9em'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }}>
              사용자명
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1em',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1em',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1em',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

// 설정 페이지 컴포넌트
function SettingsPage({ user, onPasswordChange }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword.length < 6) {
      setError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('새 비밀번호는 현재 비밀번호와 다르게 설정해주세요.');
      return;
    }

    setLoading(true);

    const result = await onPasswordChange(currentPassword, newPassword);
    
    if (result.success) {
      setSuccess(result.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>설정</h2>
      
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '500px'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>비밀번호 변경</h3>
        
        {error && (
          <div style={{
            padding: '12px',
            background: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '0.9em'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px',
            background: '#efe',
            color: '#3c3',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '0.9em'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }}>
              현재 비밀번호
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1em',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }}>
              새 비밀번호
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1em',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
            <div style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
              최소 6자 이상
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }}>
              새 비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1em',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1em',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '0.85em',
          color: '#666'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>사용자 정보</div>
          <div>사용자명: {user.username}</div>
          <div>이름: {user.name || '-'}</div>
          <div>이메일: {user.email || '-'}</div>
          <div>권한: {user.role === 'admin' ? '관리자' : '일반사용자'}</div>
        </div>
      </div>
    </div>
  );
}

// 대시보드 컴포넌트
function Dashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newMembers: 0,
    weeklyTrend: [],
    averageAttendance4Weeks: 0
  });
  const [newMembersList, setNewMembersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, newMembersResponse] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`),
        axios.get(`${API_URL}/dashboard/new-members`)
      ]);
      
      setStats(statsResponse.data);
      setNewMembersList(newMembersResponse.data);
      
      // 디버깅: 데이터 확인
      console.log('대시보드 데이터:', statsResponse.data);
    } catch (error) {
      console.error('대시보드 데이터 조회 오류:', error);
      alert('대시보드 데이터를 가져올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>;
  }

  // 출석율 추이 차트의 최대값 계산
  const maxAttendanceRate = Math.max(
    ...stats.weeklyTrend.map(w => parseFloat(w.attendanceRate)),
    100
  );

  return (
    <div style={{ padding: '20px 0' }}>
      {/* 통계 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '10px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9em', opacity: 0.9, marginBottom: '10px' }}>전체 교인수</div>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>{stats.totalMembers}</div>
          <div style={{ fontSize: '0.85em', opacity: 0.8, marginTop: '5px' }}>활성 멤버</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '30px',
          borderRadius: '10px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9em', opacity: 0.9, marginBottom: '10px' }}>최근 4주간 평균 출석교인수</div>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>{stats.averageAttendance4Weeks}</div>
          <div style={{ fontSize: '0.85em', opacity: 0.8, marginTop: '5px' }}>명</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '30px',
          borderRadius: '10px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9em', opacity: 0.9, marginBottom: '10px' }}>새신자 수</div>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>{stats.newMembers}</div>
          <div style={{ fontSize: '0.85em', opacity: 0.8, marginTop: '5px' }}>
            {stats.totalMembers > 0 
              ? ((stats.newMembers / stats.totalMembers) * 100).toFixed(1) + '%'
              : '0%'}
          </div>
        </div>
      </div>

      {/* 출석율 추이 */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>출석율 추이 (최근 8주)</h3>
        {stats.weeklyTrend.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '300px', padding: '20px 0' }}>
            {stats.weeklyTrend.map((week, index) => {
              const height = (parseFloat(week.attendanceRate) / maxAttendanceRate) * 100;
              return (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '100%',
                    height: `${height}%`,
                    minHeight: '20px',
                    background: 'linear-gradient(to top, #667eea, #764ba2)',
                    borderRadius: '4px 4px 0 0',
                    marginBottom: '10px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    padding: '5px'
                  }}>
                    <span style={{
                      color: 'white',
                      fontSize: '0.85em',
                      fontWeight: 'bold',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      {week.attendanceRate}%
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.75em',
                    color: '#666',
                    textAlign: 'center',
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'center',
                    whiteSpace: 'nowrap',
                    marginTop: '10px'
                  }}>
                    {week.weekLabel}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            출석 데이터가 없습니다.
          </div>
        )}
      </div>

      {/* 매주 새신자 명단 */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>매주 새신자 명단 (최근 8주)</h3>
        {newMembersList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {newMembersList.map((week, index) => (
              <div key={index} style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                background: '#f9f9f9'
              }}>
                <div style={{
                  fontSize: '1.1em',
                  fontWeight: 'bold',
                  color: '#667eea',
                  marginBottom: '15px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid #667eea'
                }}>
                  {week.weekLabel} ({week.members.length}명)
                </div>
                {week.members.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '10px'
                  }}>
                    {week.members.map(member => (
                      <div key={member.id} style={{
                        padding: '12px',
                        background: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{member.name}</div>
                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                          {member.phone}
                        </div>
                        {member.attendanceEvent && (
                          <div style={{ fontSize: '0.8em', color: '#999', marginTop: '5px' }}>
                            첫 출석: {member.attendanceEvent}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                    해당 주에 새신자가 없습니다.
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            최근 8주간 새신자가 없습니다.
          </div>
        )}
      </div>
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
    active: true, visit_dates: [], notes: '',
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
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  useEffect(() => {
    // 컴포넌트가 마운트되었는지 추적
    let isMounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        await Promise.all([
          fetchMembers(abortController.signal, isMounted),
          fetchOffices(abortController.signal, isMounted),
          fetchFamilies(abortController.signal, isMounted),
          fetchParties(abortController.signal, isMounted),
          fetchDepartments(abortController.signal, isMounted)
        ]);
      } catch (error) {
        if (!abortController.signal.aborted && isMounted) {
          console.error('데이터 조회 오류:', error);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
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

  const fetchMembers = async (signal, isMounted) => {
    try {
      if (isMounted) setLoading(true);
      const response = await axios.get(`${API_URL}/members`, { signal });
      if (isMounted) {
        setMembers(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      if (axios.isCancel(error)) return; // 요청 취소는 에러로 처리하지 않음
      if (isMounted) {
        console.error('성도 목록 조회 오류:', error);
        // 네트워크 에러가 아닌 경우에만 알림 표시
        if (!error.response || error.response.status !== 0) {
          alert('성도 목록을 가져올 수 없습니다.');
        }
        setMembers([]);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const fetchOffices = async (signal, isMounted) => {
    try {
      const response = await axios.get(`${API_URL}/offices`, { signal });
      if (isMounted) {
        setOffices(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      if (isMounted) {
        console.error('직분 목록 조회 오류:', error);
        setOffices([]);
      }
    }
  };

  const fetchFamilies = async (signal, isMounted) => {
    try {
      const response = await axios.get(`${API_URL}/families`, { signal });
      if (isMounted) {
        setFamilies(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      if (isMounted) {
        console.error('가족 목록 조회 오류:', error);
        setFamilies([]);
      }
    }
  };

  const fetchParties = async (signal, isMounted) => {
    try {
      const response = await axios.get(`${API_URL}/parties`, { signal });
      if (isMounted) {
        setParties(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      if (isMounted) {
        console.error('순모임 목록 조회 오류:', error);
        setParties([]);
      }
    }
  };

  const fetchDepartments = async (signal, isMounted) => {
    try {
      const response = await axios.get(`${API_URL}/departments`, { signal });
      if (isMounted) {
        setDepartments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      if (isMounted) {
        console.error('부서 목록 조회 오류:', error);
        setDepartments([]);
      }
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
        active: formData.active !== undefined ? formData.active : true,
        visit_dates: formData.visit_dates && Array.isArray(formData.visit_dates) ? formData.visit_dates : [],
        notes: formData.notes || null,
        office_ids: formData.office_ids || [],
        family_ids: formData.family_ids || [],
        party_ids: formData.party_ids || [],
        department_ids: formData.department_ids || []
      };

      if (editingId) {
        console.log('수정 요청 데이터:', submitData);
        const response = await axios.put(`${API_URL}/members/${editingId}`, submitData);
        console.log('수정 응답:', response.data);
        alert('성도 정보가 수정되었습니다.');
        setEditingId(null);
      } else {
        console.log('추가 요청 데이터:', submitData);
        const response = await axios.post(`${API_URL}/members`, submitData);
        console.log('추가 응답:', response.data);
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
        active: true, visit_dates: [], notes: '',
        office_ids: [], family_ids: [], party_ids: [], department_ids: []
      });
      
      // 목록 새로고침 (AbortController 없이 호출)
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/members`);
        setMembers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('성도 목록 조회 오류:', error);
        // 에러가 발생해도 계속 진행
      } finally {
        setLoading(false);
      }
      
      setShowForm(false); // 저장 후 폼 숨기기
    } catch (error) {
      if (axios.isCancel(error)) return; // 요청 취소는 무시
      console.error('성도 저장 오류:', error);
      console.error('에러 응답:', error.response);
      console.error('에러 데이터:', error.response?.data);
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           '저장에 실패했습니다.';
      alert(`저장 실패: ${errorMessage}`);
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
      active: member.active !== undefined ? member.active : true,
      visit_dates: (() => {
        if (!member.visit_dates) return [];
        if (Array.isArray(member.visit_dates)) return member.visit_dates;
        if (typeof member.visit_dates === 'string') {
          try {
            const parsed = JSON.parse(member.visit_dates);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      })(),
      notes: member.notes || '',
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

  const handleNewMember = () => {
    setFormData({
      name: '', phone: '', address: '', gender: '',
      birth_date: '', baptized_type: '', baptism_date: '', registration_date: '',
      dismissal_date: '', deceased: false, faith_head: '', english_name: '',
      infant_baptism: false, email: '', occupation: '', work_phone: '',
      residence_start_date: '', previous_address: '', previous_church: '', previous_office: '',
      baptism_church: '', baptism_year: '', baptism_pastor: '', education: '',
      career: '', faith_life: '', marriage_anniversary: '', stay_period: '',
      specialty: '', service_history: '',
      active: true, visit_dates: [], notes: '',
      office_ids: [], family_ids: [], party_ids: [], department_ids: []
    });
    setEditingId(null);
    setSearchInputs({ office: '', family: '', party: '', department: '' });
    setShowDropdowns({ office: false, family: false, party: false, department: false });
    setShowForm(true);
    
    // 폼 섹션으로 스크롤 이동
    setTimeout(() => {
      const formSection = document.querySelector('.form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortData = (data, column, direction) => {
    if (!column) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];
      
      // 특수 케이스 처리
      if (column === 'gender') {
        aValue = aValue === 'M' ? '남성' : aValue === 'F' ? '여성' : '';
        bValue = bValue === 'M' ? '남성' : bValue === 'F' ? '여성' : '';
      } else if (column === 'birth_date' || column === 'created_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (column === 'offices') {
        aValue = a.offices && a.offices.length > 0 ? a.offices.map(o => o.office_name).join(', ') : '';
        bValue = b.offices && b.offices.length > 0 ? b.offices.map(o => o.office_name).join(', ') : '';
      } else if (column === 'families') {
        aValue = a.families && a.families.length > 0 ? a.families.map(f => f.family_name).join(', ') : '';
        bValue = b.families && b.families.length > 0 ? b.families.map(f => f.family_name).join(', ') : '';
      } else if (column === 'parties') {
        aValue = a.parties && a.parties.length > 0 ? a.parties.map(p => p.party_name).join(', ') : '';
        bValue = b.parties && b.parties.length > 0 ? b.parties.map(p => p.party_name).join(', ') : '';
      } else if (column === 'departments') {
        aValue = a.departments && a.departments.length > 0 ? a.departments.map(d => d.department_name).join(', ') : '';
        bValue = b.departments && b.departments.length > 0 ? b.departments.map(d => d.department_name).join(', ') : '';
      }
      
      // null/undefined 처리
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      // 문자열 비교
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleCancelEdit = () => {
    setFormData({
      name: '', phone: '', address: '', gender: '',
      birth_date: '', baptized_type: '', baptism_date: '', registration_date: '',
      dismissal_date: '', deceased: false, faith_head: '', english_name: '',
      infant_baptism: false, email: '', occupation: '', work_phone: '',
      residence_start_date: '', previous_address: '', previous_church: '', previous_office: '',
      baptism_church: '', baptism_year: '', baptism_pastor: '', education: '',
      career: '', faith_life: '', marriage_anniversary: '', stay_period: '',
      specialty: '', service_history: '',
      active: true, visit_dates: [], notes: '',
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
      if (axios.isCancel(error)) return; // 요청 취소는 무시
      console.error('성도 삭제 오류:', error);
      const errorMessage = error.response?.data?.message || error.message || '삭제에 실패했습니다.';
      alert(errorMessage);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
        <button 
          type="button"
          onClick={handleNewMember}
          className="btn btn-primary"
          style={{ fontSize: '18px', padding: '12px 24px', fontWeight: '600' }}
        >
          새 성도 등록
        </button>
        {showForm && (
          <button 
            type="button"
            onClick={() => setShowForm(false)}
            className="btn btn-secondary"
            style={{ minWidth: '100px' }}
          >
            숨기기
          </button>
        )}
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
            <div className="form-row form-row-5">
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
              <div className="form-group">
                <label>심방날짜</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <input
                      type="date"
                      id="new-visit-date"
                      style={{ flex: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target;
                          const dateValue = input.value;
                          if (dateValue) {
                            if (formData.visit_dates.includes(dateValue)) {
                              alert('이미 등록된 날짜입니다.');
                              return;
                            }
                            setFormData(prev => ({
                              ...prev,
                              visit_dates: [...(prev.visit_dates || []), dateValue].sort().reverse()
                            }));
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        const input = document.getElementById('new-visit-date');
                        const dateValue = input.value;
                        if (dateValue) {
                          if (formData.visit_dates.includes(dateValue)) {
                            alert('이미 등록된 날짜입니다.');
                            return;
                          }
                          setFormData(prev => ({
                            ...prev,
                            visit_dates: [...(prev.visit_dates || []), dateValue].sort().reverse()
                          }));
                          input.value = '';
                        }
                      }}
                      style={{ whiteSpace: 'nowrap', padding: '8px 16px' }}
                    >
                      추가
                    </button>
                  </div>
                  {formData.visit_dates && formData.visit_dates.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
                      {formData.visit_dates.map((date, index) => (
                        <span key={index} style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          padding: '4px 8px', 
                          backgroundColor: '#e3f2fd', 
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}>
                          {date}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                visit_dates: prev.visit_dates.filter((_, i) => i !== index)
                              }));
                            }}
                            style={{
                              marginLeft: '8px',
                              background: 'none',
                              border: 'none',
                              color: '#666',
                              cursor: 'pointer',
                              fontSize: '18px',
                              lineHeight: '1'
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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

          {/* 기타 정보 */}
          <div className="form-subsection">
            <h3>기타 정보</h3>
            <div className="form-row form-row-1">
              <div className="form-group">
                <label>활성 여부</label>
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="checkbox-large"
                    id="active"
                  />
                  <label htmlFor="active" className="checkbox-label-large">
                    {formData.active ? '활성' : '비활성'}
                  </label>
                </div>
              </div>
            </div>
            <div className="form-row form-row-1">
              <div className="form-group">
                <label>특이사항</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="특이사항을 입력하세요..."
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? '수정' : '등록'}</button>
            {editingId && (
              <>
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">취소</button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm('정말로 이 성도를 삭제하시겠습니까?')) {
                      handleDelete(editingId);
                    }
                  }} 
                  className="btn btn-delete"
                >
                  삭제
                </button>
              </>
            )}
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
            const sortedMembers = sortData(filteredMembers, sortColumn, sortDirection);
            return (
              <div className="members-table-container">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} className="sortable-header">
                        이름 {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('phone')} className="sortable-header">
                        전화번호 {sortColumn === 'phone' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('address')} className="sortable-header">
                        주소 {sortColumn === 'address' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('gender')} className="sortable-header">
                        성별 {sortColumn === 'gender' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('birth_date')} className="sortable-header">
                        생년월일 {sortColumn === 'birth_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('offices')} className="sortable-header">
                        직분 {sortColumn === 'offices' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('families')} className="sortable-header">
                        가족 {sortColumn === 'families' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('parties')} className="sortable-header">
                        순모임 {sortColumn === 'parties' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('departments')} className="sortable-header">
                        부서 {sortColumn === 'departments' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('created_at')} className="sortable-header">
                        등록일 {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMembers.map(member => (
                      <tr 
                        key={member.id}
                        onClick={() => handleEdit(member)}
                        className={`member-row-clickable ${member.active === false ? 'inactive-row' : ''}`}
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
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

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

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortData = (data, column, direction) => {
    if (!column) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];
      
      if (column === 'created_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
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

  const handleNewFamily = () => {
    setFormData({ family_name: '', member_ids: [] });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
    setEditingId(null);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
        <button 
          type="button"
          onClick={handleNewFamily}
          className="btn btn-primary"
          style={{ fontSize: '18px', padding: '12px 24px', fontWeight: '600' }}
        >
          새 가족 등록
        </button>
        {showForm && (
          <button 
            type="button"
            onClick={() => setShowForm(false)}
            className="btn btn-secondary"
            style={{ minWidth: '100px' }}
          >
            숨기기
          </button>
        )}
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
            {editingId && (
              <>
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">취소</button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm('정말로 이 가족을 삭제하시겠습니까?')) {
                      handleDelete(editingId);
                    }
                  }} 
                  className="btn btn-delete"
                >
                  삭제
                </button>
              </>
            )}
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
            const sortedFamilies = sortData(filteredFamilies, sortColumn, sortDirection);
            return (
              <div className="members-table-container">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('family_name')} className="sortable-header">
                        가족명 {sortColumn === 'family_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('members')} className="sortable-header">
                        구성원 {sortColumn === 'members' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('created_at')} className="sortable-header">
                        등록일 {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFamilies.map(family => (
                      <tr 
                        key={family.id}
                        onClick={() => handleEdit(family)}
                        className="member-row-clickable"
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{family.family_name}</td>
                        <td>{family.members || '-'}</td>
                        <td>{new Date(family.created_at).toLocaleDateString()}</td>
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
  const [leaderSearchInput, setLeaderSearchInput] = useState('');
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);
  const [partySearchKeyword, setPartySearchKeyword] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // 폼 표시 여부 (초기값: 숨김)
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchParties();
    fetchMembers();
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowMemberDropdown(false);
        setShowLeaderDropdown(false);
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

  const handleLeaderSearchInput = (value) => {
    setLeaderSearchInput(value);
    setShowLeaderDropdown(value.length > 0);
  };

  const handleSelectLeader = (member) => {
    setFormData(prev => ({
      ...prev,
      leader_id: member.id
    }));
    setLeaderSearchInput('');
    setShowLeaderDropdown(false);
  };

  const handleRemoveLeader = () => {
    setFormData(prev => ({
      ...prev,
      leader_id: ''
    }));
    setLeaderSearchInput('');
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortData = (data, column, direction) => {
    if (!column) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];
      
      if (column === 'leader_name') {
        aValue = a.leader_name || '';
        bValue = b.leader_name || '';
      } else if (column === 'created_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getFilteredLeaders = () => {
    if (!leaderSearchInput.trim()) return [];
    const keyword = leaderSearchInput.toLowerCase();
    
    return (Array.isArray(members) ? members : []).filter(member => {
      const name = (member.name || '').toLowerCase();
      const phone = (member.phone || '').toLowerCase();
      return (name.includes(keyword) || phone.includes(keyword)) && member.id !== formData.leader_id;
    });
  };

  const getSelectedLeader = () => {
    if (!formData.leader_id) return null;
    return (Array.isArray(members) ? members : []).find(member => member.id === formData.leader_id);
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
    setLeaderSearchInput('');
    setShowLeaderDropdown(false);
    
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

  const handleNewParty = () => {
    setFormData({ party_name: '', leader_id: '', member_ids: [] });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
    setLeaderSearchInput('');
    setShowLeaderDropdown(false);
    setEditingId(null);
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
    setLeaderSearchInput('');
    setShowLeaderDropdown(false);
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
      setLeaderSearchInput('');
      setShowLeaderDropdown(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
        <button 
          type="button"
          onClick={handleNewParty}
          className="btn btn-primary"
          style={{ fontSize: '18px', padding: '12px 24px', fontWeight: '600' }}
        >
          새 순모임 등록
        </button>
        {showForm && (
          <button 
            type="button"
            onClick={() => setShowForm(false)}
            className="btn btn-secondary"
            style={{ minWidth: '100px' }}
          >
            숨기기
          </button>
        )}
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
            <div className="autocomplete-container">
              <input
                type="text"
                placeholder="순장 이름 또는 전화번호로 검색..."
                value={leaderSearchInput}
                onChange={(e) => handleLeaderSearchInput(e.target.value)}
                onFocus={() => leaderSearchInput && setShowLeaderDropdown(true)}
                className="autocomplete-input"
              />
              {showLeaderDropdown && getFilteredLeaders().length > 0 && (
                <div className="autocomplete-dropdown">
                  {getFilteredLeaders().map(member => (
                    <div
                      key={member.id}
                      className="autocomplete-item"
                      onClick={() => handleSelectLeader(member)}
                    >
                      {member.name} ({member.phone})
                    </div>
                  ))}
                </div>
              )}
              {getSelectedLeader() && (
                <div className="selected-tags" style={{ marginTop: '10px' }}>
                  <span className="tag">
                    {getSelectedLeader().name} ({getSelectedLeader().phone})
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={handleRemoveLeader}
                    >
                      ×
                    </button>
                  </span>
                </div>
              )}
            </div>
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
            {editingId && (
              <>
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">취소</button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm('정말로 이 순모임을 삭제하시겠습니까?')) {
                      handleDelete(editingId);
                    }
                  }} 
                  className="btn btn-delete"
                >
                  삭제
                </button>
              </>
            )}
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
            const sortedParties = sortData(filteredParties, sortColumn, sortDirection);
            return (
              <div className="members-table-container">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('party_name')} className="sortable-header">
                        순모임명 {sortColumn === 'party_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('leader_name')} className="sortable-header">
                        순장 {sortColumn === 'leader_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('members')} className="sortable-header">
                        순원 {sortColumn === 'members' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('created_at')} className="sortable-header">
                        등록일 {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedParties.map(party => (
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
    members: [] // [{position_name, member_id}]
  });
  const [loading, setLoading] = useState(false);
  const [departmentSearchKeyword, setDepartmentSearchKeyword] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // 폼 표시 여부 (초기값: 숨김)
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  // 구성원 추가를 위한 임시 상태
  const [newMemberPosition, setNewMemberPosition] = useState('');
  const [newMemberSearchInput, setNewMemberSearchInput] = useState('');
  const [showNewMemberDropdown, setShowNewMemberDropdown] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchMembers();
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowNewMemberDropdown(false);
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

  const getFilteredMembersForNew = () => {
    if (!newMemberSearchInput.trim()) return [];
    const keyword = newMemberSearchInput.toLowerCase();
    const selectedIds = formData.members.map(m => m.member_id);
    
    return (Array.isArray(members) ? members : []).filter(member => {
      const name = (member.name || '').toLowerCase();
      const phone = (member.phone || '').toLowerCase();
      return (name.includes(keyword) || phone.includes(keyword)) && !selectedIds.includes(member.id);
    });
  };

  const handleNewMemberSearchInput = (value) => {
    setNewMemberSearchInput(value);
    setShowNewMemberDropdown(value.length > 0);
  };

  const handleAddMember = (member) => {
    if (!newMemberPosition.trim()) {
      alert('직책을 입력해주세요.');
      return;
    }
    
    setFormData(prev => {
      // 이미 추가된 멤버인지 확인
      if (prev.members.some(m => m.member_id === member.id)) {
        alert('이미 추가된 구성원입니다.');
        return prev;
      }
      return {
        ...prev,
        members: [...prev.members, { position_name: newMemberPosition.trim(), member_id: member.id }]
      };
    });
    setNewMemberPosition('');
    setNewMemberSearchInput('');
    setShowNewMemberDropdown(false);
  };

  const handleRemoveMember = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortData = (data, column, direction) => {
    if (!column) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];
      
      if (column === 'created_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getMemberName = (memberId) => {
    const member = (Array.isArray(members) ? members : []).find(m => m.id === memberId);
    return member ? member.name : '';
  };

  // 구성원을 직책별로 그룹화하는 함수
  const groupMembersByPosition = (membersArray) => {
    if (!membersArray || !Array.isArray(membersArray) || membersArray.length === 0) {
      return [];
    }
    
    const grouped = {};
    membersArray.forEach(m => {
      const position = m.position_name || '직책없음';
      if (!grouped[position]) {
        grouped[position] = [];
      }
      grouped[position].push(m.member_name || '-');
    });
    
    return Object.entries(grouped).map(([position, names]) => ({
      position,
      names
    }));
  };

  const handleEdit = (department) => {
    setEditingId(department.id);
    
    // members 배열을 그대로 사용 (이미 {position_name, member_id} 형태)
    const departmentMembers = (department.members && Array.isArray(department.members)) 
      ? department.members.map(m => ({ position_name: m.position_name || '', member_id: m.member_id }))
      : [];
    
    setFormData({
      department_name: department.department_name,
      members: departmentMembers
    });
    setNewMemberPosition('');
    setNewMemberSearchInput('');
    setShowNewMemberDropdown(false);
    
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

  const handleNewDepartment = () => {
    setFormData({ 
      department_name: '', 
      members: []
    });
    setNewMemberPosition('');
    setNewMemberSearchInput('');
    setShowNewMemberDropdown(false);
    setEditingId(null);
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
    setFormData({ 
      department_name: '', 
      members: []
    });
    setNewMemberPosition('');
    setNewMemberSearchInput('');
    setShowNewMemberDropdown(false);
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
        members: []
      });
      setNewMemberPosition('');
      setNewMemberSearchInput('');
      setShowNewMemberDropdown(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
        <button 
          type="button"
          onClick={handleNewDepartment}
          className="btn btn-primary"
          style={{ fontSize: '18px', padding: '12px 24px', fontWeight: '600' }}
        >
          새 부서 등록
        </button>
        {showForm && (
          <button 
            type="button"
            onClick={() => setShowForm(false)}
            className="btn btn-secondary"
            style={{ minWidth: '100px' }}
          >
            숨기기
          </button>
        )}
      </div>
      {showForm && (
      <section className="form-section">
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>부서명 *</label>
            <input type="text" name="department_name" value={formData.department_name} onChange={handleInputChange} required />
          </div>
          
          {/* 구성원 추가 */}
          <div className="form-subsection">
            <h3>구성원 추가</h3>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', gap: '15px', alignItems: 'center' }}>
              {/* 직책 섹션 - 왼쪽 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 1 auto', minWidth: '200px' }}>
                <label style={{ whiteSpace: 'nowrap', marginRight: '5px' }}>직책</label>
                <input
                  type="text"
                  placeholder="직책을 입력하세요 (예: 부장, 회장, 담당교역자 등)"
                  value={newMemberPosition}
                  onChange={(e) => setNewMemberPosition(e.target.value)}
                  style={{ flex: '1', minWidth: '150px' }}
                />
              </div>
              {/* 성도검색 섹션 - 오른쪽 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto', minWidth: '250px' }}>
                <label style={{ whiteSpace: 'nowrap', marginRight: '5px' }}>성도검색</label>
                <div className="autocomplete-container" style={{ flex: '1', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="성도 이름 또는 전화번호로 검색..."
                    value={newMemberSearchInput}
                    onChange={(e) => handleNewMemberSearchInput(e.target.value)}
                    onFocus={() => newMemberSearchInput && setShowNewMemberDropdown(true)}
                    className="autocomplete-input"
                    style={{ width: '100%' }}
                  />
                  {showNewMemberDropdown && getFilteredMembersForNew().length > 0 && (
                    <div className="autocomplete-dropdown">
                      {getFilteredMembersForNew().map(member => (
                        <div
                          key={member.id}
                          className="autocomplete-item"
                          onClick={() => handleAddMember(member)}
                        >
                          {member.name} ({member.phone})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 추가된 구성원 목록 */}
            {formData.members && formData.members.length > 0 && (
              <div className="form-group">
                <div className="selected-tags" style={{ marginTop: '10px' }}>
                  {formData.members.map((member, index) => (
                    <span key={index} className="tag">
                      <strong>{member.position_name}</strong>: {getMemberName(member.member_id)}
                      <button
                        type="button"
                        className="tag-remove"
                        onClick={() => handleRemoveMember(index)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? '수정' : '등록'}</button>
            {editingId && (
              <>
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">취소</button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm('정말로 이 부서를 삭제하시겠습니까?')) {
                      handleDelete(editingId);
                    }
                  }} 
                  className="btn btn-delete"
                >
                  삭제
                </button>
              </>
            )}
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
            
            // members 배열에서 검색
            const membersText = (department.members && Array.isArray(department.members))
              ? department.members.map(m => `${m.position_name || ''} ${m.member_name || ''}`).join(' ').toLowerCase()
              : '';
            
            return departmentName.includes(keyword) || membersText.includes(keyword);
          });

          if (loading) {
            return <p>로딩 중...</p>;
          } else if (filteredDepartments.length === 0) {
            return <p>{departmentSearchKeyword ? '검색 결과가 없습니다.' : '등록된 부서가 없습니다.'}</p>;
          } else {
            const sortedDepartments = sortData(filteredDepartments, sortColumn, sortDirection);
            return (
              <>
                <div className="members-table-container">
                  <table className="members-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('department_name')} className="sortable-header">
                          부서명 {sortColumn === 'department_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>구성원</th>
                        <th onClick={() => handleSort('created_at')} className="sortable-header">
                          등록일 {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDepartments.map(department => (
                        <tr 
                          key={department.id}
                          onClick={() => handleEdit(department)}
                          className="member-row-clickable"
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{department.department_name}</td>
                          <td>
                            {(() => {
                              const grouped = groupMembersByPosition(department.members);
                              if (grouped.length === 0) {
                                return '-';
                              }
                              return grouped.map((group, idx) => (
                                <span key={idx} style={{ display: 'inline-block', marginRight: '15px', marginBottom: '4px' }}>
                                  <strong>{group.position}</strong>: {group.names.join(', ')}
                                </span>
                              ));
                            })()}
                          </td>
                          <td>{new Date(department.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {departmentSearchKeyword && (
                  <div className="search-result-info">
                    검색 결과: {filteredDepartments.length}개 / 전체 {departments.length}개
                  </div>
                )}
              </>
            );
          }
        })()}
      </section>
    </div>
  );
}

// 조직 관리 컴포넌트
function OrganizationManagement() {
  const [organizations, setOrganizations] = useState([]);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    member_id: '',
    position: '',
    responsibility: '',
    appointment_date: '',
    active: true,
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [memberSearchInput, setMemberSearchInput] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [organizationSearchKeyword, setOrganizationSearchKeyword] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchOrganizations();
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

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/organizations`);
      setOrganizations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('조직 구성원 목록 조회 오류:', error);
      alert('조직 구성원 목록을 가져올 수 없습니다.');
      setOrganizations([]);
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

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortData = (data, column, direction) => {
    if (!column) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];
      
      if (column === 'appointment_date' || column === 'created_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (column === 'active') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }
      
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMemberSearchInput = (value) => {
    setMemberSearchInput(value);
    setShowMemberDropdown(value.length > 0);
  };

  const handleSelectMember = (member) => {
    setFormData(prev => ({
      ...prev,
      member_id: member.id
    }));
    setMemberSearchInput('');
    setShowMemberDropdown(false);
  };

  const handleRemoveMember = () => {
    setFormData(prev => ({
      ...prev,
      member_id: ''
    }));
    setMemberSearchInput('');
  };

  const getFilteredMembers = () => {
    if (!memberSearchInput.trim()) return [];
    const keyword = memberSearchInput.toLowerCase();
    
    return (Array.isArray(members) ? members : []).filter(member => {
      const name = (member.name || '').toLowerCase();
      const phone = (member.phone || '').toLowerCase();
      return (name.includes(keyword) || phone.includes(keyword)) && member.id !== formData.member_id;
    });
  };

  const getSelectedMember = () => {
    if (!formData.member_id) return null;
    return (Array.isArray(members) ? members : []).find(member => member.id === formData.member_id);
  };

  const handleNewOrganization = () => {
    setFormData({
      member_id: '',
      position: '',
      responsibility: '',
      appointment_date: '',
      active: true,
      notes: ''
    });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
    setEditingId(null);
    setShowForm(true);
    
    // 폼 섹션으로 스크롤 이동
    setTimeout(() => {
      const formSection = document.querySelector('.form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleEdit = (organization) => {
    setEditingId(organization.id);
    setFormData({
      member_id: organization.member_id || '',
      position: organization.position || '',
      responsibility: organization.responsibility || '',
      appointment_date: organization.appointment_date || '',
      active: organization.active !== undefined ? organization.active : true,
      notes: organization.notes || ''
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
    setFormData({
      member_id: '',
      position: '',
      responsibility: '',
      appointment_date: '',
      active: true,
      notes: ''
    });
    setMemberSearchInput('');
    setShowMemberDropdown(false);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.position.trim()) {
      alert('직책을 입력해주세요.');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/organizations/${editingId}`, formData);
        alert('조직 구성원 정보가 수정되었습니다.');
      } else {
        await axios.post(`${API_URL}/organizations`, formData);
        alert('조직 구성원이 등록되었습니다.');
      }
      setFormData({
        member_id: '',
        position: '',
        responsibility: '',
        appointment_date: '',
        active: true,
        notes: ''
      });
      setMemberSearchInput('');
      setShowMemberDropdown(false);
      setEditingId(null);
      fetchOrganizations();
      setShowForm(false);
    } catch (error) {
      console.error(editingId ? '조직 구성원 수정 오류:' : '조직 구성원 등록 오류:', error);
      alert(editingId ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 조직 구성원을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_URL}/organizations/${id}`);
      alert('조직 구성원이 삭제되었습니다.');
      fetchOrganizations();
    } catch (error) {
      console.error('조직 구성원 삭제 오류:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
        <button 
          type="button"
          onClick={handleNewOrganization}
          className="btn btn-primary"
          style={{ fontSize: '18px', padding: '12px 24px', fontWeight: '600' }}
        >
          새 조직 구성원 등록
        </button>
        {showForm && (
          <button 
            type="button"
            onClick={() => setShowForm(false)}
            className="btn btn-secondary"
            style={{ minWidth: '100px' }}
          >
            숨기기
          </button>
        )}
      </div>
      {showForm && (
      <section className="form-section">
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-subsection">
            <h3>기본 정보</h3>
            <div className="form-row form-row-4">
              <div className="form-group">
                <label>직책 *</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="직책을 입력하세요"
                  required
                />
              </div>
              <div className="form-group">
                <label>담당부서</label>
                <input type="text" name="responsibility" value={formData.responsibility} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>성도 선택</label>
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
                  {getSelectedMember() && (
                    <div className="selected-tags" style={{ marginTop: '10px' }}>
                      <span className="tag">
                        {getSelectedMember().name} ({getSelectedMember().phone})
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={handleRemoveMember}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>임명날짜</label>
                <input type="date" name="appointment_date" value={formData.appointment_date} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-row form-row-1">
              <div className="form-group">
                <label>특이사항</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="특이사항을 입력하세요..."
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div className="form-row form-row-1">
              <div className="form-group">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="checkbox-large"
                    id="org-active"
                  />
                  <label htmlFor="org-active" className="checkbox-label-large">
                    {formData.active ? '활성' : '비활성'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? '수정' : '등록'}</button>
            {editingId && (
              <>
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">취소</button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm('정말로 이 조직 구성원을 삭제하시겠습니까?')) {
                      handleDelete(editingId);
                    }
                  }} 
                  className="btn btn-delete"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </form>
      </section>
      )}

      <section className="list-section">
        <div className="list-header">
          <h2>조직 구성원 목록</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="직책, 이름, 담당부서로 검색..."
              value={organizationSearchKeyword}
              onChange={(e) => setOrganizationSearchKeyword(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        {(() => {
          const filteredOrganizations = organizations.filter(org => {
            if (!organizationSearchKeyword.trim()) return true;
            const keyword = organizationSearchKeyword.toLowerCase();
            const position = (org.position || '').toLowerCase();
            const memberName = (org.member_name || '').toLowerCase();
            const responsibility = (org.responsibility || '').toLowerCase();
            
            return position.includes(keyword) || 
                   memberName.includes(keyword) || 
                   responsibility.includes(keyword);
          });

          if (loading) {
            return <p>로딩 중...</p>;
          } else if (filteredOrganizations.length === 0) {
            return <p>{organizationSearchKeyword ? '검색 결과가 없습니다.' : '등록된 조직 구성원이 없습니다.'}</p>;
          } else {
            const sortedOrganizations = sortData(filteredOrganizations, sortColumn, sortDirection);
            return (
              <div className="members-table-container">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('position')} className="sortable-header">
                        직책 {sortColumn === 'position' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('member_name')} className="sortable-header">
                        이름 {sortColumn === 'member_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('member_phone')} className="sortable-header">
                        전화번호 {sortColumn === 'member_phone' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('responsibility')} className="sortable-header">
                        담당부서/업무 {sortColumn === 'responsibility' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('appointment_date')} className="sortable-header">
                        임명날짜 {sortColumn === 'appointment_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('active')} className="sortable-header">
                        활성 {sortColumn === 'active' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('created_at')} className="sortable-header">
                        등록일 {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOrganizations.map(org => (
                      <tr 
                        key={org.id}
                        onClick={() => handleEdit(org)}
                        className={`member-row-clickable ${org.active === false ? 'inactive-row' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{org.position}</td>
                        <td>{org.member_name || '-'}</td>
                        <td>{org.member_phone || '-'}</td>
                        <td>{org.responsibility || '-'}</td>
                        <td>{org.appointment_date ? new Date(org.appointment_date).toLocaleDateString() : '-'}</td>
                        <td>{org.active ? '활성' : '비활성'}</td>
                        <td>{new Date(org.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        })()}
        {organizationSearchKeyword && (
          <div className="search-result-info">
            검색 결과: {organizations.filter(org => {
              const keyword = organizationSearchKeyword.toLowerCase();
              const position = (org.position || '').toLowerCase();
              const memberName = (org.member_name || '').toLowerCase();
              const responsibility = (org.responsibility || '').toLowerCase();
              return position.includes(keyword) || 
                     memberName.includes(keyword) || 
                     responsibility.includes(keyword);
            }).length}명 / 전체 {organizations.length}명
          </div>
        )}
      </section>
    </div>
  );
}

// 출석부 관리 컴포넌트
function AttendanceManagement() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [addingGuest, setAddingGuest] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFormData, setEventFormData] = useState({
    event_name: '',
    event_date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm 형식
    creator_id: null
  });
  const [allMembers, setAllMembers] = useState([]);
  const [creatorSearchInput, setCreatorSearchInput] = useState('');
  const [showCreatorDropdown, setShowCreatorDropdown] = useState(false);

  useEffect(() => {
    if (!selectedEvent) {
      fetchEvents();
    }
    // 모든 성도 목록 가져오기 (작성자 검색용)
    fetchAllMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent]); // fetchEvents와 fetchAllMembers는 의존성에서 제외 (무한 루프 방지)

  useEffect(() => {
    if (selectedEvent && selectedEvent.id) {
      fetchAttendance(selectedEvent.id);
      setSearchQuery(''); // 이벤트 변경 시 검색어 초기화
    }
  }, [selectedEvent?.id]); // selectedEvent.id만 의존성으로 사용

  // 외부 클릭 시 작성자 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowCreatorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchAllMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/members`);
      setAllMembers(response.data || []);
    } catch (error) {
      console.error('성도 목록 조회 오류:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/attendance/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('이벤트 목록 조회 오류:', error);
      alert('이벤트 목록을 가져올 수 없습니다.');
    }
  };

  const fetchAttendance = async (eventId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/attendance/events/${eventId}`);
      // 멤버 목록만 업데이트 (이벤트 정보는 handleEventSelect에서 이미 설정됨)
      setMembers(response.data.allMembers || []);
    } catch (error) {
      console.error('출석부 조회 오류:', error);
      alert('출석부를 가져올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewEvent = () => {
    setEventFormData({
      event_name: '',
      event_date: new Date().toISOString().slice(0, 16),
      creator_id: null
    });
    setCreatorSearchInput('');
    setShowCreatorDropdown(false);
    setShowEventForm(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!eventFormData.event_name.trim()) {
      alert('이벤트명을 입력해주세요.');
      return;
    }

    try {
      await axios.post(`${API_URL}/attendance/events`, eventFormData);
      alert('출석부 이벤트가 생성되었습니다.');
      setShowEventForm(false);
      setCreatorSearchInput('');
      setShowCreatorDropdown(false);
      fetchEvents();
    } catch (error) {
      console.error('이벤트 생성 오류:', error);
      alert(error.response?.data?.error || '이벤트 생성에 실패했습니다.');
    }
  };

  // 작성자 검색 필터링
  const filteredCreatorMembers = allMembers.filter(member => {
    if (!creatorSearchInput.trim()) return false;
    const keyword = creatorSearchInput.toLowerCase();
    return member.name && member.name.toLowerCase().includes(keyword);
  });

  const handleCreatorSelect = (member) => {
    setEventFormData({ ...eventFormData, creator_id: member.id });
    setCreatorSearchInput(member.name);
    setShowCreatorDropdown(false);
  };

  const handleEventSelect = async (event) => {
    // 이벤트 선택 시 작성자 정보를 포함한 전체 정보 가져오기
    try {
      const response = await axios.get(`${API_URL}/attendance/events/${event.id}`);
      if (response.data.event) {
        setSelectedEvent(response.data.event);
      } else {
        setSelectedEvent(event);
      }
    } catch (error) {
      console.error('이벤트 정보 조회 오류:', error);
      // 오류 시 기본 이벤트 정보라도 설정
      setSelectedEvent(event);
    }
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
    setMembers([]);
  };

  const handleMemberClick = async (member) => {
    if (!selectedEvent) return;

    // 현재 출석 상태
    const currentAttended = member.attended ? 1 : 0;
    const newAttended = currentAttended ? 0 : 1;

    // 즉시 UI 업데이트 (optimistic update)
    setMembers(prevMembers => 
      prevMembers.map(m => 
        m.id === member.id 
          ? { ...m, attended: newAttended }
          : m
      )
    );

    // 백그라운드에서 데이터베이스 업데이트
    try {
      const response = await axios.post(`${API_URL}/attendance/records`, {
        event_id: selectedEvent.id,
        member_id: member.id
      });
      
      // 서버 응답으로 최종 상태 확인 (동기화)
      setMembers(prevMembers => 
        prevMembers.map(m => 
          m.id === member.id 
            ? { ...m, attended: response.data.attended ? 1 : 0 }
            : m
        )
      );
    } catch (error) {
      console.error('출석 기록 토글 오류:', error);
      
      // 실패 시 이전 상태로 롤백
      setMembers(prevMembers => 
        prevMembers.map(m => 
          m.id === member.id 
            ? { ...m, attended: currentAttended }
            : m
        )
      );
      
      alert('출석 기록 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !newGuestName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setAddingGuest(true);
    try {
      const response = await axios.post(`${API_URL}/attendance/add-guest`, {
        event_id: selectedEvent.id,
        name: newGuestName.trim()
      });

      // 새 멤버를 목록에 추가 (출석 상태로, is_new_member 포함)
      const newMember = {
        id: response.data.member.id,
        name: response.data.member.name,
        phone: response.data.member.phone,
        attended: 1,
        is_new_member: response.data.member.is_new_member || response.data.isNewMember
      };

      // 이미 목록에 있는지 확인
      const existingIndex = members.findIndex(m => m.id === newMember.id);
      if (existingIndex >= 0) {
        // 기존 멤버가 있으면 출석 상태와 새신자 정보 업데이트
        setMembers(prevMembers => 
          prevMembers.map(m => 
            m.id === newMember.id 
              ? { ...m, attended: 1, is_new_member: newMember.is_new_member }
              : m
          )
        );
      } else {
        // 새 멤버 추가
        setMembers(prevMembers => [...prevMembers, newMember]);
      }
      
      // 출석부 다시 불러오기 (데이터베이스의 최신 정보 반영)
      await fetchAttendance(selectedEvent.id);

      setNewGuestName('');
    } catch (error) {
      console.error('신규 출석자 추가 오류:', error);
      alert('신규 출석자 추가에 실패했습니다.');
    } finally {
      setAddingGuest(false);
    }
  };

  const handleDeleteEvent = async (eventId, e) => {
    e.stopPropagation();
    if (!window.confirm('정말로 이 출석부 이벤트를 삭제하시겠습니까?')) return;
    
    try {
      await axios.delete(`${API_URL}/attendance/events/${eventId}`);
      alert('출석부 이벤트가 삭제되었습니다.');
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(null);
        setMembers([]);
      }
      fetchEvents();
    } catch (error) {
      console.error('이벤트 삭제 오류:', error);
      alert('이벤트 삭제에 실패했습니다.');
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 출석부 카드 뷰 (전체 화면)
  if (selectedEvent) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '15px',
          padding: '10px 0'
        }}>
          <div>
            <button 
              onClick={handleBackToList} 
              className="btn btn-secondary"
              style={{ marginRight: '15px' }}
            >
              ← 목록으로
            </button>
            <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
              {selectedEvent.event_name}
            </span>
          </div>
          <div style={{ color: '#666', fontSize: '0.95em' }}>
            {formatDateTime(selectedEvent.event_date)} | 
            출석: {members.filter(m => m.attended).length}명 / 전체: {members.length}명
            {selectedEvent.creator_name && ` (작성자: ${selectedEvent.creator_name})`}
          </div>
        </div>

        {/* 검색 필드와 신규 출석자 추가 폼 (좌우 배치) */}
        <div style={{ 
          marginBottom: '15px', 
          display: 'flex',
          gap: '15px',
          alignItems: 'stretch'
        }}>
          {/* 검색 필드 */}
          <div style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '6px'
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="성도 이름으로 검색..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.95em',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 신규 출석자 추가 폼 */}
          <div style={{ 
            flex: 1,
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '6px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <form onSubmit={handleAddGuest} style={{ display: 'flex', gap: '10px', flex: 1, alignItems: 'center', width: '100%' }}>
              <input
                type="text"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                placeholder="신규 출석자 이름 입력"
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.95em'
                }}
                disabled={addingGuest}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addingGuest || !newGuestName.trim()}
                style={{ whiteSpace: 'nowrap' }}
              >
                {addingGuest ? '추가 중...' : '추가'}
              </button>
            </form>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '10px',
            padding: '10px 0'
          }}>
            {(() => {
              const filteredMembers = members.filter(member => {
                if (!searchQuery.trim()) return true;
                return member.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
              });

              if (filteredMembers.length === 0 && searchQuery.trim()) {
                return (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '40px',
                    color: '#999'
                  }}>
                    검색 결과가 없습니다.
                  </div>
                );
              }

              return filteredMembers.map((member) => {
                const isNewMember = member.is_new_member === 1 || member.is_new_member === true;
                return (
                  <div
                    key={member.id}
                    onClick={() => handleMemberClick(member)}
                    style={{
                      padding: '10px 8px',
                      border: isNewMember 
                        ? (member.attended ? '2px solid #ff9800' : '2px solid #ffb74d')
                        : (member.attended ? '2px solid #4caf50' : '2px solid #ddd'),
                      borderRadius: '6px',
                      backgroundColor: isNewMember
                        ? (member.attended ? '#fff3e0' : '#fff')
                        : (member.attended ? '#e8f5e9' : '#fff'),
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      boxShadow: isNewMember
                        ? (member.attended ? '0 2px 4px rgba(255, 152, 0, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)')
                        : (member.attended ? '0 2px 4px rgba(76, 175, 80, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)'),
                      minHeight: '50px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = isNewMember
                        ? (member.attended ? '0 2px 4px rgba(255, 152, 0, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)')
                        : (member.attended ? '0 2px 4px rgba(76, 175, 80, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)');
                    }}
                  >
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '0.95em',
                      wordBreak: 'keep-all',
                      marginBottom: isNewMember ? '2px' : '0'
                    }}>
                      {member.name}
                    </div>
                    {isNewMember && (
                      <div style={{ 
                        fontSize: '0.75em', 
                        color: '#ff9800',
                        fontWeight: 'bold',
                        marginTop: '2px'
                      }}>
                        (신규)
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    );
  }

  // 이벤트 목록 페이지 (전체 화면)
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>출석부 관리</h2>
        <button onClick={handleNewEvent} className="btn btn-primary">
          새 출석부 이벤트 생성
        </button>
      </div>

      {showEventForm && (
        <section className="form-section" style={{ marginBottom: '30px' }}>
          <h3>새 출석부 이벤트</h3>
          <form onSubmit={handleEventSubmit}>
            <div className="form-group">
              <label>이벤트명 *</label>
              <input
                type="text"
                value={eventFormData.event_name}
                onChange={(e) => setEventFormData({ ...eventFormData, event_name: e.target.value })}
                placeholder="예: 주일예배, 수요예배, 특별집회 등"
                required
              />
            </div>
            <div className="form-group">
              <label>날짜 및 시간 *</label>
              <input
                type="datetime-local"
                value={eventFormData.event_date}
                onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>작성자 (선택사항)</label>
              <div className="autocomplete-container" style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={creatorSearchInput}
                  onChange={(e) => {
                    setCreatorSearchInput(e.target.value);
                    setShowCreatorDropdown(true);
                  }}
                  onFocus={() => {
                    if (creatorSearchInput.trim()) {
                      setShowCreatorDropdown(true);
                    }
                  }}
                  placeholder="작성자 이름을 입력하세요"
                  style={{ width: '100%' }}
                />
                {showCreatorDropdown && filteredCreatorMembers.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {filteredCreatorMembers.slice(0, 10).map(member => (
                      <div
                        key={member.id}
                        onClick={() => handleCreatorSelect(member)}
                        style={{
                          padding: '10px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        {member.name} {member.phone ? `(${member.phone})` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">생성</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEventForm(false)}>
                취소
              </button>
            </div>
          </form>
        </section>
      )}

      <section>
        <h3>이벤트 목록</h3>
        {events.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666', border: '1px solid #ddd', borderRadius: '4px' }}>
            등록된 이벤트가 없습니다. "새 출석부 이벤트 생성" 버튼을 클릭하여 이벤트를 생성하세요.
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => handleEventSelect(event)}
                style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: '10px' }}>
                  {event.event_name}
                </div>
                <div style={{ fontSize: '0.95em', color: '#666', marginBottom: '8px' }}>
                  {formatDateTime(event.event_date)}
                </div>
                {event.creator_name && (
                  <div style={{ fontSize: '0.85em', color: '#888', marginBottom: '5px' }}>
                    작성자: {event.creator_name}
                  </div>
                )}
                <div style={{ fontSize: '0.9em', color: '#999', marginBottom: '10px' }}>
                  출석: {event.attendance_count || 0}명
                </div>
                <button
                  onClick={(e) => handleDeleteEvent(event.id, e)}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.85em',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '5px'
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;