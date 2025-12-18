import './ProfileHeader.css';

interface ProfileHeaderProps {
  name: string;
  grade: string;
  onEditClick: () => void;
}

export default function ProfileHeader({ name, grade, onEditClick }: ProfileHeaderProps) {
  return (
    <section className="profile-header">
      <div className="profile-header__info">
        <h2 className="profile-header__greeting">
          반가워요! <span className="profile-header__name">{name}</span>님
        </h2>
        <span className="profile-header__grade">{grade} 등급</span>
      </div>
      <button
        type="button"
        className="profile-header__edit-button"
        onClick={onEditClick}
      >
        프로필 수정
      </button>
    </section>
  );
}
