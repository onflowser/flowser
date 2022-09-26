import { CommonUtils } from "../../../utils/common-utils";
import RadioButton from "../../../components/radio-button/RadioButton";
import React, { ReactElement } from "react";
import Input, { InputProps } from "../../../components/input/Input";
import { Project } from "@flowser/shared";
import classNames from "classnames";
import classes from "./FormFields.module.scss";
import ToggleButton from "../../../components/toggle-button/ToggleButton";
import { FormikErrors } from "formik";

export type FieldProps = InputProps & {
  label?: string;
  description?: string;
  path: string;
  className?: string;
  formik: {
    handleChange: (e: React.ChangeEvent) => void;
    values: Project;
    errors: FormikErrors<Project>;
    setFieldValue: (
      field: string,
      value: unknown,
      shouldValidate?: boolean
    ) => void;
  };
};

export function TextField({
  label,
  description,
  formik,
  path,
  className,
  ...inputProps
}: FieldProps): ReactElement {
  const error = CommonUtils.getNestedValue(formik.errors, path) as string;
  return (
    <div className={classNames(classes.textFieldRoot, className)}>
      <span className={classes.label}>{label}</span>
      <div className={classes.input}>
        <Input
          {...inputProps}
          name={path}
          value={CommonUtils.getNestedValue(formik.values, path) as string}
          onChange={formik.handleChange}
        />
      </div>
      <span className={classes.description}>
        {error ? (
          <span className={classes.errorMessage}>{error}</span>
        ) : (
          description
        )}
      </span>
    </div>
  );
}

export type RadioFieldProps = FieldProps & {
  options: RadioFieldOption[];
};

export type RadioFieldOption = {
  label: string;
  value: string | number;
};

export function RadioField({
  label,
  description,
  formik,
  path,
  options,
  disabled,
  className,
}: RadioFieldProps): ReactElement {
  const value = CommonUtils.getNestedValue(formik.values, path);

  return (
    <div className={classNames(classes.radioFieldRoot, className)}>
      <div className={classes.header}>
        <b className={classes.title}>{label}</b>
        <span className={classes.description}>{description}</span>
      </div>
      <div className={classes.body}>
        {options.map((option) => (
          <div key={option.value} className={classes.radioItem}>
            <span>{option.label}</span>
            <RadioButton
              disabled={disabled}
              checked={value === option.value}
              onChange={() => formik.setFieldValue(path, option.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ToggleField({
  label,
  description,
  formik,
  path,
  disabled,
  className,
}: FieldProps): ReactElement {
  const value = CommonUtils.getNestedValue(formik.values, path) as boolean;

  return (
    <div className={classNames(classes.toggleFieldRoot, className)}>
      <span className={classes.label}>{label}</span>
      <div className={classes.input}>
        <span>False</span>
        <ToggleButton
          className={classes.toggleButton}
          disabled={disabled}
          value={value}
          onChange={(state) => formik.setFieldValue(path, state)}
        />
        <span>True</span>
      </div>
      <span className={classes.description}>{description}</span>
    </div>
  );
}
