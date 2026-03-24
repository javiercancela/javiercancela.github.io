from google.cloud import bigquery
import pandas as pd

def export_stores_per_company_to_csv(output_csv_path="stores_per_company.csv"):
    """
    Query the BigQuery table my_dataset.my_stores and export a CSV with
    the number of stores and total employees per company.

    Args:
        output_csv_path (str): Path for the output CSV file
    """
    # Initialize BigQuery client
    client = bigquery.Client()

    # SQL query to aggregate data by company_id
    query = """
        SELECT
            company_id,
            COUNT(store_id) AS num_stores,
            SUM(employees_number) AS total_employees
        FROM `my_dataset.my_stores`
        GROUP BY company_id
        ORDER BY company_id
    """

    try:
        # Execute the query and load results into a pandas DataFrame
        df = client.query(query).to_dataframe()

        # Save to CSV
        df.to_csv(output_csv_path, index=False)
        print(f"✅ CSV file '{output_csv_path}' created successfully!")
        print(f"📊 Summary: {len(df)} companies found.")

        # Optional: Display first few rows
        print("\nSample output:")
        print(df.head())

        return df

    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")
        raise

if __name__ == "__main__":
    export_stores_per_company_to_csv()
