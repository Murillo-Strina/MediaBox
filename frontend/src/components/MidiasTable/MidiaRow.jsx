import React from 'react';
import styles from '../../styles/MidiasTable.module.css';

export default function MidiaRow({
  item,
  isSelected,
  onSelect,
}) {
  return (
    <tr
      className={isSelected ? styles.selectedRow : ''}
      onClick={onSelect}
    >
      <td>
        <img src={item.capa} alt={item.titulo} className={styles.capaImg}/>
      </td>
      <td>{item.titulo}</td>
      <td>{item.tipo}</td>
      <td>{item.progresso}</td>
      <td>{item.dataInclusao?.toDate?.().toLocaleDateString() || item.dataInclusao}</td>
      <td>{Array.isArray(item.genero) ? item.genero.join(', ') : item.genero}</td>
      <td title={item.comentario}>{item.comentario}</td>
      <td>{item.nota}
      </td>
    </tr>
  );
}
