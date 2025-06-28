import styles from '../../styles/MidiasTable.module.css';
import StarReview from '../StarReview/StarReview';

function formatDate(dateValue) {
  if (dateValue?.toDate) {
    return dateValue.toDate().toLocaleDateString();
  }
  if (typeof dateValue === 'string') {
    const [year, month, day] = dateValue.split('-');
    return `${day}/${month}/${year}`;
  }
  return '';
}

export default function MidiaRow({
  item,
  isSelected,
  onSelect,
  fadeOut = false
}) {
  return (
    <tr
      className={`${isSelected ? styles.selectedRow : ''} ${fadeOut ? styles.fadeOut : ''}`}
      onClick={onSelect}
    >
      <td data-cell="Capa">
        <img src={item.capa} alt={item.titulo} className={styles.capaImg}/>
      </td>
      <td data-cell="Título">{item.titulo}</td>
      <td data-cell="Tipo">{item.tipo}</td>
      <td data-cell="Progresso">{item.progresso}</td>
      <td data-cell="Data de inclusão">{formatDate(item.dataInclusao)}</td>
      <td data-cell="Gênero">
        <div className={styles.genreContainer}>
          {Array.isArray(item.genero) && item.genero.map((genre, index) => (
            <span key={index} className={styles.genreBadge}>{genre}</span>
          ))}
        </div>
      </td>
      <td data-cell="Comentário" title={item.comentario}>{item.comentario}</td>
      <td data-cell="Nota">
        <StarReview rating={item.nota} />
      </td>
    </tr>
  );
}