const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'groundster.db');
const db = new sqlite3.Database(dbPath);

function formatTurnoLabel(fechaStr, timeStr) {
  if (!fechaStr || !timeStr || timeStr === '—') return 'Día';
  const dateParts = fechaStr.split('-');
  if (dateParts.length !== 3) return 'Día';
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  const currentDate = new Date(year, month, day);
  const timeParts = timeStr.split(':');
  const hour = parseInt(timeParts[0], 10);
  if (isNaN(hour)) return 'Día';
  const formattedDay = (d) => String(d).padStart(2, '0');
  if (hour >= 8 && hour < 20) {
    return `☀️ Día ${formattedDay(day)}`;
  } else {
    if (hour >= 20) {
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(currentDate.getDate() + 1);
      return `🌙 Noche ${formattedDay(day)}-${formattedDay(tomorrow.getDate())}`;
    } else {
      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 1);
      return `🌙 Noche ${formattedDay(yesterday.getDate())}-${formattedDay(day)}`;
    }
  }
}

db.all('SELECT * FROM events ORDER BY id ASC', (err, rows) => {
  if (err) {
    console.error(err);
    db.close();
    return;
  }
  
  const blocks = rows.map(evt => {
    let block = `### Evento ${evt.id} — ${evt.machine}\n\n`;
    block += `- **Fecha:** ${evt.fecha}\n`;
    block += `- **Reporte:** ${evt.reporte}\n`;
    block += `- **Finalización:** ${evt.finalizacion}\n`;
    block += `- **Afectación:** ${evt.afectacion}\n`;
    const statusIcon = evt.estado === 'Cerrado' ? '✅' : '🔴';
    block += `- **Estado:** ${statusIcon} ${evt.estado}\n`;
    block += `- **Turno:** ${formatTurnoLabel(evt.fecha, evt.reporte)}\n`;
    block += `- **Jefe de Turno:** ${evt.jefe}\n`;
    if (evt.creador && evt.creador !== 'Desconocido') {
      block += `- **Enviado por:** ${evt.creador}\n`;
    }
    block += `- **Canal Oficial:** ${evt.canal_oficial}\n\n`;
    block += `**Causa:** ${evt.causa}`;
    return block;
  });
  
  const mdContent = "# ⚡ Eventos Groundster\n\n---\n\n" + blocks.join('\n\n---\n\n') + '\n';
  const msgMdPath = path.join(__dirname, '..', 'msg.md');
  
  fs.writeFileSync(msgMdPath, mdContent, 'utf8');
  console.log('✅ msg.md sincronizado y normalizado con la base de datos.');
  db.close();
});
