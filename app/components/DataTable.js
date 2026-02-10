export default function DataTable({ columns, rows }) {
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((col) => {
                const value = row[col.key];
                const className =
                  typeof value === "string" && value.startsWith("(")
                    ? "negative"
                    : col.key.includes("profit") && typeof value === "string"
                      ? "negative"
                      : "";
                return (
                  <td key={col.key} className={className}>
                    {col.render ? col.render(row) : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
