export function objectToFormData<
  T extends Record<
    string,
    string | number | boolean | File | object | null | undefined
  >,
>(obj: T): FormData {
  const formData = new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value instanceof FileList) {
        Array.from(value).forEach((file) => formData.append(key, file));
      } else if (
        Array.isArray(value) &&
        value.every((v) => v instanceof File)
      ) {
        (value as File[]).forEach((file) => formData.append(key, file));
      } else if (Array.isArray(value)) {
        // Spring: localizations[0].languageCode, assets[0].asset[0].id vb.
        value.forEach((item, index) => {
          if (item != null && typeof item === "object" && !(item instanceof File)) {
            Object.entries(item as Record<string, unknown>).forEach(([k, v]) => {
              if (v != null) {
                const prefix = `${key}[${index}].${k}`;
                if (Array.isArray(v)) {
                  v.forEach((subItem, subIdx) => {
                    if (subItem != null && typeof subItem === "object" && !(subItem instanceof File)) {
                      Object.entries(subItem as Record<string, unknown>).forEach(([subK, subV]) => {
                        if (subV != null && typeof subV !== "object") {
                          formData.append(`${prefix}[${subIdx}].${subK}`, String(subV));
                        }
                      });
                    }
                  });
                } else {
                  formData.append(prefix, String(v));
                }
              }
            });
          } else {
            formData.append(`${key}[${index}]`, String(item));
          }
        });
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        if (String(value) !== "") {
          formData.append(key, String(value));
        }
      }
    }
  });

  return formData;
}
