from datetime import datetime
import re


def parking_lot_key_not_found(d : dict):
    key_not_found_list = []
    for i in ['prime_location_name', 'price_per_minute', 'number_of_spots', 'pincode', 'address']:
        if i not in d.keys():
            key_not_found_list.append(f'"{i}" key not found.')
    return key_not_found_list

def parking_lot_fields_validation(d : dict):
    fields_validation_list = []
    if not isinstance(d['prime_location_name'], str):
        fields_validation_list.append('"prime_location_name" must be a string.')
    elif not (
        re.fullmatch('^[A-Za-z][A-Za-z .]*$', d['prime_location_name']) and
        1 < len(d['prime_location_name']) <= 30
    ):
        fields_validation_list.append('Given prime_location_name not valid.')
    
    if not isinstance(d['price_per_minute'], (int, float)):
        fields_validation_list.append('"Given "price_per_minute" not valid.')
    elif not 1 <= d['price_per_minute'] <= 3:
        fields_validation_list.append('price_per_minute must be a float greater than or equal to 1 and less than or equal to 3.')

    if not isinstance(d['number_of_spots'], int):
        fields_validation_list.append('"number_of_spots" must be an integer.')
    elif not 0 <= d['number_of_spots'] <= 30:
        fields_validation_list.append('number_of_spots must be an integer from 0 to 30.')

    if not isinstance(d['pincode'], int):
        fields_validation_list.append('"pincode" must be an integer.')
    elif not 100000 <= d['pincode'] <= 999999:
        fields_validation_list.append('pincode must be an integer from 100000 to 999999.')

    if not isinstance(d['address'], str):
        fields_validation_list.append('"address" must be a string.')
    elif not 0 < len(d['address']) <= 200:
        fields_validation_list.append('Given address not valid.')

    return fields_validation_list

def get_time_str(iso):
    if iso:
        time = datetime.fromisoformat(iso)
        return f'DATE : {time.strftime('%b %d, %Y')}. TIME : {time.strftime('%H:%M:%S')}'
    else:
        return None