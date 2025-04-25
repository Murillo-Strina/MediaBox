import React from 'react'
import MidiaRow from './MidiaRow'
import styles from '../../styles/MidiasTable.module.css'

export default function MidiasTable({ items, onRatingChange }) {
  if (!items.length) {
    return (
      <div className={styles.emptyState}>
        <p>Nenhuma mídia cadastrada.</p>
      </div>
    )
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Capa</th>
            <th>Título</th>
            <th>Tipo</th>
            <th>Progresso</th>
            <th>Data de Inclusão</th>
            <th>Gênero</th>
            <th>Comentário</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <MidiaRow
              key={item.id ?? idx}              
              item={{
                ...item,
                genero: Array.isArray(item.genero)
                  ? item.genero.join(', ')
                  : item.genero
              }}
              onRatingChange={onRatingChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
