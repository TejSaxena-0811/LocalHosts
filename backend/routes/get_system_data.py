from flask import Blueprint, request, jsonify
import pandas as pd

get_system_data = Blueprint('get_system_data', __name__)

@get_system_data.route('/get_system_data', methods=['GET'])
def get_system_data_route():
    excel_file_path = 'smc_table.xlsx'  
    df = pd.read_excel(excel_file_path, engine='openpyxl')

    columns_to_return = ['System Master Identifier', 'Business Description', 'Technical Description']
    df = df[columns_to_return]

    system_id = request.args.get('systemId')

    if system_id is None:
        return jsonify({"error": "System ID is required"}), 400

    system_data = df[df['System Master Identifier'] == system_id]

    if system_data.empty:
        return jsonify({"error": "System ID not found"}), 404

    system_data_dict = system_data.to_dict(orient='records')[0]

    return jsonify(system_data_dict), 200