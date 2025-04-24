import React from 'react'
import styles from '../../styles/MidiasTable.module.css'

export default function MidiaRow({ item, onRatingChange }) {
  return (
    <tr>
      <td><img src={item.capa} alt={`${item.titulo} — capa`} className={styles.capaImg}/></td>
      <td>{item.titulo}</td>
      <td>{item.tipo}</td>
      <td>{item.progresso}</td>
      <td>{item.dataInclusao}</td>
      <td>{item.genero}</td>
      <td title={item.comentario}>{item.comentario}</td>
      <td>{item.nota}</td>
    </tr>
  )
}
