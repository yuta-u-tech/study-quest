interface ItemMediaProps {
  media?: { image?: string; audio?: string }
}

/** 問題に添付された図・写真（パスは public/data/ からの相対） */
export default function ItemMedia({ media }: ItemMediaProps) {
  if (!media?.image) return null
  return (
    <img
      className="item-image"
      src={`${import.meta.env.BASE_URL}data/${media.image}`}
      alt="問題の図"
      loading="lazy"
    />
  )
}
