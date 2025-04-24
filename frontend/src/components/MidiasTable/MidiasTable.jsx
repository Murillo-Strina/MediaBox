import React from 'react'
import styles from '../../styles/MidiasTable.module.css'
import MidiaRow from './MidiaRow'

export default function MidiasTable({ items, onRatingChange }) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Capa</th><th>Título</th><th>Tipo</th><th>Progresso</th>
            <th>Data de Inclusão</th><th>Gênero</th><th>Comentário</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item =>
            <MidiaRow key={item.id} item={item} onRatingChange={onRatingChange}/>
          )}
        </tbody>
      </table>
    </div>
  )
}
