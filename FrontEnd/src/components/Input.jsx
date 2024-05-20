import React, { useId } from "react";

const Input = React.forwardRef(function Input(
  { label, type = "text", classname = "", ...props },
  ref
) // DOUBT: why are we using ref ?
// ANS: when we go to the PostForm.jsx we can see that
//      when we write the title , automatically the slug
//      is created . Without ref it isnot possible
//      in PostForm.jsx we can see that a useEffect that
//      uses watch is responsible for the automatic
//      generation . in that useEffect the changes made to
//      value of the input field should be made to the DOM
//      that is done by ref.

// DOUBT: ref is not explicitely passed when using this
//        component in the PostForm.jsx or any other parent
//        component. Why ?
// ANS:   cause it is implicitly done when we use the register
//        function .
{
  const id = useId();
  return (
    <div className="w-full">
      {label && (
        <label className="inline-block mb-1 pl-1" htmlFor={id}>
          {label}
        </label>
      )}

      <input
        type={type}
        className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full ${classname}`}
        ref={ref}
        // DOUBT : why is it used ..... Find it when using this input in the parent component
        // ANS : ref is used when we need to change
        //      the DOM of the component in which we are
        //      using it from the parent component (
        //      suppose if we use this input from the
        //      login conmponent then that login component
        //      is the parent and the Input component is the
        //      child)

        {...props}
        id={id}
        // it is said that the label and input are now
        // having the same id , therefore when we click
        // on the label the input box will be selected
        // CHECK THIS!!!!!!!
      />
    </div>
  );
});

export default Input;