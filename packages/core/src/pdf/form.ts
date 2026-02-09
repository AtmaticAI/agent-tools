import { PDFDocument } from 'pdf-lib';
import type { FormField, FormInfo, FillFormOptions } from './types';
import { toUint8Array } from './utils';

export async function readFormFields(
  file: Buffer | Uint8Array
): Promise<FormInfo> {
  const data = toUint8Array(file);
  const pdfDoc = await PDFDocument.load(data);
  const form = pdfDoc.getForm();
  const pdfFields = form.getFields();

  const fields: FormField[] = pdfFields.map((field) => {
    const name = field.getName();
    const typeName = field.constructor.name;

    switch (typeName) {
      case 'PDFTextField': {
        const tf = field as import('pdf-lib').PDFTextField;
        return { name, type: 'text' as const, value: tf.getText() ?? '' };
      }
      case 'PDFCheckBox': {
        const cb = field as import('pdf-lib').PDFCheckBox;
        return { name, type: 'checkbox' as const, value: cb.isChecked() };
      }
      case 'PDFRadioGroup': {
        const rg = field as import('pdf-lib').PDFRadioGroup;
        return {
          name,
          type: 'radio' as const,
          value: rg.getSelected() ?? '',
          options: rg.getOptions(),
        };
      }
      case 'PDFDropdown': {
        const dd = field as import('pdf-lib').PDFDropdown;
        return {
          name,
          type: 'dropdown' as const,
          value: dd.getSelected()[0] ?? '',
          options: dd.getOptions(),
        };
      }
      default:
        return { name, type: 'text' as const, value: '' };
    }
  });

  return { fields, fieldCount: fields.length };
}

export async function fillFormFields(
  file: Buffer | Uint8Array,
  data: Record<string, string | boolean>,
  options: FillFormOptions = {}
): Promise<Uint8Array> {
  const fileData = toUint8Array(file);
  const pdfDoc = await PDFDocument.load(fileData);
  const form = pdfDoc.getForm();

  for (const [fieldName, value] of Object.entries(data)) {
    const field = form.getField(fieldName);
    const typeName = field.constructor.name;

    switch (typeName) {
      case 'PDFTextField': {
        const tf = field as import('pdf-lib').PDFTextField;
        tf.setText(String(value));
        break;
      }
      case 'PDFCheckBox': {
        const cb = field as import('pdf-lib').PDFCheckBox;
        if (value === true || value === 'true') {
          cb.check();
        } else {
          cb.uncheck();
        }
        break;
      }
      case 'PDFRadioGroup': {
        const rg = field as import('pdf-lib').PDFRadioGroup;
        rg.select(String(value));
        break;
      }
      case 'PDFDropdown': {
        const dd = field as import('pdf-lib').PDFDropdown;
        dd.select(String(value));
        break;
      }
    }
  }

  if (options.flatten) {
    form.flatten();
  }

  return pdfDoc.save();
}
