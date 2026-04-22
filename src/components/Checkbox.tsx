import {type ComponentProps, useId} from "react";

export const CheckboxToggle = ({children, ...props}: ComponentProps<"input">) => {
  const id = useId();
  return <div className="flex flex-row gap-1">
    <div className="relative m-auto">
      <input
        id={id}
        type="checkbox"
        className="block appearance-none w-5 h-5 border rounded-xs
        bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400
        checked:bg-neutral-500 checked:hover:bg-neutral-600 checked:active:bg-neutral-400"
        {...props}
      />
      <span
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-neutral-200">
      <svg className="w-4" viewBox="0 0 5 4" fill="none" aria-hidden="true">
          <polyline points="1,2 2,3 4,1" stroke="currentColor" strokeWidth=".7" strokeLinecap="round"
                    strokeLinejoin="round"/>
      </svg>
    </span>
    </div>
    <label htmlFor={id} className="my-auto">{children}</label>
  </div>
}
