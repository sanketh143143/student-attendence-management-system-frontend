const $ = (id) => document.getElementById(id);
const TODAY = new Date().toISOString().slice(0, 10);
const seedStudents = [
  {id:1, roll:'AIML001', name:'Ravi Kumar', dept:'CSE-AIML', year:'III Year'},
  {id:2, roll:'AIML002', name:'Sravya Reddy', dept:'CSE-AIML', year:'III Year'},
  {id:3, roll:'AIML003', name:'Arjun Rao', dept:'CSE-AIML', year:'III Year'}
];
let students = load('attendEaseStudents', seedStudents);
let records = load('attendEaseRecords', []);
let nextStudentId = Math.max(0, ...students.map(s => s.id)) + 1;
let currentPage = 'overview';
let toastTimer;

function load(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : structuredClone(fallback); }
  catch { return structuredClone(fallback); }
}
function persist() {
  localStorage.setItem('attendEaseStudents', JSON.stringify(students));
  localStorage.setItem('attendEaseRecords', JSON.stringify(records));
}
function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function initials(name='') { return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase(); }
function niceDate(date) {
  if (!date) return '—';
  const d = new Date(`${date}T12:00:00`);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}
function showToast(message) {
  $('toast').textContent = message; $('toast').classList.remove('hidden');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>$('toast').classList.add('hidden'), 2800);
}
function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(el => el.classList.toggle('active', el.id === `page-${page}`));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
  const names = {overview:'Overview',students:'Students',attendance:'Mark attendance',reports:'Reports'};
  $('breadcrumbPage').textContent = names[page] || 'Overview';
  $('sidebar').classList.remove('open');
  if(page==='students') renderStudents();
  if(page==='attendance') { fillStudentSelect(); renderRecentAttendance(); }
  if(page==='reports') renderReports();
  if(page==='overview') renderOverview();
}
function studentById(id) { return students.find(s=>s.id===Number(id)); }
function getTodayRecords() { return records.filter(r=>r.date===TODAY); }
function renderOverview() {
  const today = getTodayRecords();
  const present = today.filter(r=>r.status==='Present').length;
  const absent = today.filter(r=>r.status==='Absent').length;
  const overallPresent = records.filter(r=>r.status==='Present').length;
  const overall = records.length ? Math.round(overallPresent/records.length*100) : null;
  $('statStudents').textContent = students.length;
  $('statPresent').textContent = present;
  $('statAbsent').textContent = absent;
  $('statOverall').textContent = overall===null ? '—' : `${overall}%`;
  $('presentRate').textContent = `${today.length ? Math.round(present/today.length*100) : 0}%`;
  $('absentRate').textContent = `${today.length ? Math.round(absent/today.length*100) : 0}%`;
  $('studentNavCount').textContent = students.length;
  $('legendPresent').textContent = present;
  $('legendAbsent').textContent = absent;
  $('legendUnmarked').textContent = Math.max(0,students.length - new Set(today.map(r=>r.studentId)).size);
  const rate = today.length ? Math.round(present/today.length*100) : 0;
  $('donutValue').textContent = `${rate}%`;
  $('todayDonut').style.background = `conic-gradient(var(--purple) ${rate*3.6}deg, #eeedfa ${rate*3.6}deg 360deg)`;
  const recent = [...students].sort((a,b)=>b.id-a.id).slice(0,5);
  $('recentStudents').innerHTML = recent.map(s=>`<tr><td>${studentIdentity(s)}</td><td>${escapeHtml(s.roll)}</td><td>${escapeHtml(s.dept)}</td><td>${escapeHtml(s.year)}</td></tr>`).join('');
  $('recentEmpty').classList.toggle('hidden',recent.length>0);
}
function studentIdentity(s) {
  return `<div class="student-cell"><span class="student-avatar">${escapeHtml(initials(s.name))}</span><span><span class="student-name">${escapeHtml(s.name)}</span><span class="student-meta">${escapeHtml(s.dept)}</span></span></div>`;
}
function renderStudents() {
  const q = $('studentSearch').value.trim().toLowerCase();
  const filtered = students.filter(s=>[s.name,s.roll,s.dept,s.year].some(v=>v.toLowerCase().includes(q))).sort((a,b)=>a.roll.localeCompare(b.roll));
  $('studentResultCount').textContent = `${filtered.length} student${filtered.length===1?'':'s'}`;
  $('studentsTable').innerHTML = filtered.map(s=>`<tr><td>${studentIdentity(s)}</td><td>${escapeHtml(s.roll)}</td><td>${escapeHtml(s.dept)}</td><td>${escapeHtml(s.year)}</td><td><div class="row-actions"><button class="action-btn" title="Edit student" data-edit="${s.id}">✎</button><button class="action-btn" title="Delete student" data-delete="${s.id}">⌫</button></div></td></tr>`).join('');
  $('studentsEmpty').classList.toggle('hidden',filtered.length>0);
  $('studentNavCount').textContent = students.length;
}
function openStudentModal(id=null) {
  $('studentForm').reset(); $('studentFormError').classList.add('hidden');
  $('editStudentId').value = id || '';
  const s = id ? studentById(id) : null;
  $('studentModalTitle').textContent = s ? 'Edit student' : 'Add a student';
  if(s) { $('studentRoll').value=s.roll; $('studentName').value=s.name; $('studentDept').value=s.dept; $('studentYear').value=s.year; }
  $('studentModal').classList.remove('hidden'); $('studentRoll').focus();
}
function closeStudentModal() { $('studentModal').classList.add('hidden'); }
function fillStudentSelect() {
  const select = $('attStudent'); const previous = select.value;
  select.innerHTML = '<option value="">Choose a student</option>' + [...students].sort((a,b)=>a.roll.localeCompare(b.roll)).map(s=>`<option value="${s.id}">${escapeHtml(s.roll)} — ${escapeHtml(s.name)}</option>`).join('');
  if(students.some(s=>String(s.id)===previous)) select.value=previous;
  $('attDate').value = $('attDate').value || TODAY;
}
function renderRecentAttendance() {
  const list = [...records].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,5);
  $('recentAttendance').innerHTML = list.map(r=>{const s=studentById(r.studentId);return s?`<tr><td>${studentIdentity(s)}</td><td>${escapeHtml(r.subject)}</td><td>${niceDate(r.date)}</td><td><span class="pill ${r.status.toLowerCase()}">${r.status}</span></td></tr>`:''}).join('');
  $('attendanceEmpty').classList.toggle('hidden',list.some(Boolean));
}
function showAttendanceMessage(message, success=true) {
  const el=$('attendanceMessage');el.textContent=message;el.className=`message ${success?'success':'error-msg'}`;
}
function reportRows() {
  const q=$('reportSearch').value.trim().toLowerCase();
  const subject=$('reportSubject').value;
  const groups=new Map();
  records.forEach(r=>{
    const s=studentById(r.studentId); if(!s)return;
    if(q && !`${s.roll} ${s.name}`.toLowerCase().includes(q))return;
    if(subject && r.subject!==subject)return;
    const key=`${s.id}::${r.subject}`;
    if(!groups.has(key))groups.set(key,{student:s,subject:r.subject,present:0,total:0});
    const g=groups.get(key);g.total++;if(r.status==='Present')g.present++;
  });
  return [...groups.values()].sort((a,b)=>a.student.roll.localeCompare(b.student.roll)||a.subject.localeCompare(b.subject));
}
function renderReports() {
  const old=$('reportSubject').value;
  const subjects=[...new Set(records.map(r=>r.subject))].sort((a,b)=>a.localeCompare(b));
  $('reportSubject').innerHTML='<option value="">All subjects</option>'+subjects.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  if(subjects.includes(old))$('reportSubject').value=old;
  const rows=reportRows();
  const total=rows.reduce((n,r)=>n+r.total,0), present=rows.reduce((n,r)=>n+r.present,0);
  $('reportTotal').textContent=total;$('reportPresent').textContent=present;
  $('reportAverage').textContent=total?`${Math.round(present/total*100)}%`:'—';
  $('reportsTable').innerHTML=rows.map(r=>{const pct=Math.round(r.present/r.total*100);return `<tr><td>${escapeHtml(r.student.roll)}</td><td>${studentIdentity(r.student)}</td><td>${escapeHtml(r.subject)}</td><td>${r.present}</td><td>${r.total}</td><td class="bar-cell"><strong>${pct}%</strong><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div></td></tr>`}).join('');
  $('reportsEmpty').classList.toggle('hidden',rows.length>0);
}
function exportCsv() {
  const rows=reportRows();
  if(!rows.length){showToast('No report records to export.');return;}
  const data=[['Roll Number','Student','Subject','Present','Total','Attendance %'],...rows.map(r=>[r.student.roll,r.student.name,r.subject,r.present,r.total,`${(r.present/r.total*100).toFixed(2)}%`])];
  const csv=data.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a');a.href=url;a.download='attendance-report.csv';a.click();URL.revokeObjectURL(url);showToast('CSV report exported.');
}
$('loginForm').addEventListener('submit',e=>{
  e.preventDefault();
  if($('username').value.trim()==='admin' && $('password').value==='admin123') {
    $('loginError').classList.add('hidden');$('loginView').classList.add('hidden');$('appView').classList.remove('hidden');
    $('todayLabel').textContent=new Date().toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
    navigate('overview');
  } else $('loginError').classList.remove('hidden');
});
$('togglePassword').addEventListener('click',()=>{const input=$('password');input.type=input.type==='password'?'text':'password';$('togglePassword').textContent=input.type==='password'?'Show':'Hide';});
$('logoutBtn').addEventListener('click',()=>{$('password').value='';$('appView').classList.add('hidden');$('loginView').classList.remove('hidden');});
document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.goto)));
$('menuBtn').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
$('newStudentBtn').addEventListener('click',()=>openStudentModal());
$('closeModal').addEventListener('click',closeStudentModal);$('cancelModal').addEventListener('click',closeStudentModal);
$('studentModal').addEventListener('click',e=>{if(e.target===$('studentModal'))closeStudentModal();});
$('studentSearch').addEventListener('input',renderStudents);
$('studentsTable').addEventListener('click',e=>{
  const edit=e.target.closest('[data-edit]'), del=e.target.closest('[data-delete]');
  if(edit)openStudentModal(Number(edit.dataset.edit));
  if(del){const id=Number(del.dataset.delete),s=studentById(id);if(!s)return;if(!confirm(`Delete ${s.name} and their attendance records?`))return;students=students.filter(x=>x.id!==id);records=records.filter(r=>r.studentId!==id);persist();renderStudents();renderOverview();showToast('Student deleted.');}
});
$('studentForm').addEventListener('submit',e=>{
  e.preventDefault();const id=Number($('editStudentId').value)||null;
  const data={roll:$('studentRoll').value.trim(),name:$('studentName').value.trim(),dept:$('studentDept').value.trim(),year:$('studentYear').value};
  const duplicate=students.some(s=>s.roll.toLowerCase()===data.roll.toLowerCase()&&s.id!==id);
  if(duplicate){$('studentFormError').textContent='That roll number is already registered.';$('studentFormError').classList.remove('hidden');return;}
  if(id){students=students.map(s=>s.id===id?{...s,...data}:s);showToast('Student details updated.');}
  else{students.push({id:nextStudentId++,...data});showToast('Student added successfully.');}
  persist();closeStudentModal();renderStudents();renderOverview();fillStudentSelect();
});
$('attendanceForm').addEventListener('submit',e=>{
  e.preventDefault();
  const studentId=Number($('attStudent').value),subject=$('attSubject').value.trim(),date=$('attDate').value,status=document.querySelector('input[name="status"]:checked').value;
  if(!studentById(studentId)){showAttendanceMessage('Please add and select a student first.',false);return;}
  if(!subject||!date){showAttendanceMessage('Enter a subject and attendance date.',false);return;}
  const existing=records.find(r=>r.studentId===studentId&&r.date===date&&r.subject.toLowerCase()===subject.toLowerCase());
  if(existing){existing.status=status;existing.subject=subject;showAttendanceMessage('Existing attendance updated successfully.');}
  else{records.push({id:Date.now(),studentId,subject,date,status});showAttendanceMessage('Attendance saved successfully.');}
  persist();renderRecentAttendance();renderOverview();renderReports();showToast('Attendance saved.');
});
$('attendanceForm').addEventListener('reset',()=>setTimeout(()=>{ $('attDate').value=TODAY; $('attendanceMessage').classList.add('hidden'); },0));
$('reportSearch').addEventListener('input',renderReports);$('reportSubject').addEventListener('change',renderReports);$('exportBtn').addEventListener('click',exportCsv);
$('attDate').value=TODAY;
