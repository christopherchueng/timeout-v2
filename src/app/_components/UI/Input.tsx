import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  title?: string;
  testId?: string;
  placeholder?: string;
  // register: UseFormRegister<AlarmlistFormValues>;
}

// @see React Hook Form reference: https://stackoverflow.com/questions/70442081/what-type-is-register-from-react-hook-form

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, value, testId, placeholder, title, ...rest }: InputProps, ref) => {
    return (
      <label
        htmlFor={label}
        className="row-reverse relative mb-1 flex w-48 translate-y-0 cursor-text items-center border-b border-b-gray-400 transition focus-within:border-b-slate-900"
      >
        <input
          id={label}
          name={label}
          aria-labelledby={label}
          ref={ref}
          placeholder={placeholder}
          data-testid={testId}
          autoComplete="on"
          className="peer w-full bg-transparent pb-1.5 pt-4 text-xs outline-none placeholder:opacity-0 placeholder:transition-all focus:placeholder:opacity-100"
          {...rest}
        />
        <span
          className={clsx(
            "group:-translate-y-3.5 group:pt-1 empty:translate-y-0! pointer-events-none absolute left-0 top-4 select-none text-slate-900 transition-all duration-75 placeholder:text-white peer-focus:-translate-y-4 peer-focus:pt-1 peer-focus:text-2xs",
            // Show placeholder above value if input is filled out and user clicks out of input field
            value ? "-translate-y-4 pt-1 text-2xs" : "text-xs",
          )}
        >
          {title ?? placeholder}
        </span>
      </label>
    );
  },
);

export default Input;
