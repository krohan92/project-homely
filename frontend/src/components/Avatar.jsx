export const Avatar = ({ member, size = 40, className = "" }) => {
  const s = { width: size, height: size };
  if (member?.avatar) {
    return (
      <img
        src={member.avatar}
        alt={member.name}
        style={s}
        data-testid={`avatar-${member.name}`}
        className={`shrink-0 rounded-full border-2 border-card object-cover shadow-[0_4px_14px_rgb(0,0,0,0.10)] ${className}`}
      />
    );
  }
  return (
    <span
      style={{ ...s, background: member?.color || "#E07A5F" }}
      className={`grid shrink-0 place-items-center rounded-full font-display font-black text-white ${className}`}
    >
      {member?.name?.[0] || "?"}
    </span>
  );
};
