const fs = require('fs');
const path = require('path');
const { openDb } = require('../config/db');
const { formatTurnoLabel } = require('./helpers');

function syncDatabaseToMarkdown() {
  const db = openDb();
  db.all('SELECT * FROM events ORDER BY id ASC', (err, rows) => {
    if (err) {
      console.error('❌ Error al consultar eventos para sincronización:', err);
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
      
      const shiftLabel = formatTurnoLabel(evt.fecha, evt.reporte);
      block += `- **Turno:** ${shiftLabel}\n`;
      block += `- **Jefe de Turno:** ${evt.jefe}\n`;
      if (evt.creador && evt.creador !== 'Desconocido') {
        block += `- **Enviado por:** ${evt.creador}\n`;
      }
      block += `- **Canal Oficial:** ${evt.canal_oficial}\n\n`;
      block += `**Causa:** ${evt.causa}`;
      return block;
    });
    
    const mdContent = "# ⚡ Eventos Groundster\n\n---\n\n" + blocks.join('\n\n---\n\n') + '\n';
    const msgMdPath = path.join(__dirname, '..', '..', 'msg.md');
    
    fs.writeFile(msgMdPath, mdContent, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('❌ Error al escribir en msg.md:', writeErr);
      } else {
        console.log('🔄 Sincronización exitosa: msg.md actualizado con los datos de la base de datos.');
      }
      db.close();
    });
  });
}

module.exports = {
  syncDatabaseToMarkdown
};
