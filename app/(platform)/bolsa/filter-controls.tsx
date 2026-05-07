"use client";

type AutoSubmitSelectProps = {
  name: string;
  value?: string;
  className?: string;
  "aria-label"?: string;
  options: { value: string; label: string }[];
};

export function AutoSubmitSelect({
  name,
  value,
  className,
  options,
  "aria-label": ariaLabel,
}: AutoSubmitSelectProps) {
  return (
    <select
      name={name}
      defaultValue={value ?? ""}
      aria-label={ariaLabel}
      className={className}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
    >
      {options.map((option) => (
        <option key={`${name}-${option.value}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
