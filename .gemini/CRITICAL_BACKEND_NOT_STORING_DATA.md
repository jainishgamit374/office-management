# 🚨 CRITICAL FIX: Backend Data Storage Logic

## The Logic You Requested ✅

Based on your images and requirements, the backend **MUST** implement this exact mapping:

| App Sends (Integer) | Backend Action | Database Stores (String) |
|---------------------|----------------|--------------------------|
| **1**               | Punch In       | **"IN"**                 |
| **2**               | Punch Out      | **"OUT"**                |
| **0**               | No Punch       | **NULL**                 |

---

## 🔧 THE PYTHON FIX CODE

Replace your existing `/emp-punch/` function with this logic:

```python
@app.route('/emp-punch/', methods=['POST'])
def emp_punch():
    try:
        # 1. Get JSON data
        data = request.get_json()
        
        # 2. Extract Fields (Handle missing values safely)
        punch_type_num = data.get('PunchType', 0)   # Default to 0
        latitude = data.get('Latitude', 0)
        longitude = data.get('Longitude', 0)
        is_away = data.get('IsAway', False)
        
        # 3. IMPLEMENT MAPPING LOGIC (0 -> NULL, 1 -> IN, 2 -> OUT)
        if punch_type_num == 1:
            punch_type_str = 'IN'
        elif punch_type_num == 2:
            punch_type_str = 'OUT'
        else:
            punch_type_str = None  # 0 -> NULL
            
        # 4. Convert Lat/Long to Float safe
        try:
            lat_float = float(latitude)
            lon_float = float(longitude)
        except (ValueError, TypeError) as conv_err:
            print(f"⚠️ Coordinate conversion failed for Lat={latitude}, Lon={longitude}: {conv_err}")
            lat_float = 0.0
            lon_float = 0.0

        # Log for debugging
        print(f"📍 Received: Type={punch_type_num}, Lat={latitude}, Lon={longitude}")
        print(f"👉 Mapped to: Type={punch_type_str}, Lat={lat_float}, Lon={lon_float}")

        # Get Employee ID
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'status': 'Error', 'message': 'Missing Authorization Header'}), 401
            
        employee_id = get_employee_from_token(auth_header)
        current_date = datetime.now().date()
        current_time = datetime.now().time()
        
        # 5. DB STORAGE LOGIC
        
        # CASE 1: PUNCH IN (1)
        if punch_type_num == 1:
            cursor.execute("""
                INSERT INTO attendance (
                    employee_id, date, 
                    punch_type,              -- Store 'IN'
                    punch_in_time, 
                    punch_in_latitude,       -- Store Latitude
                    punch_in_longitude,      -- Store Longitude
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (employee_id, date) DO UPDATE SET
                    punch_type = ?,          -- Update to 'IN'
                    punch_in_latitude = ?,   -- Update Latitude
                    punch_in_longitude = ?   -- Update Longitude
            """, (
                employee_id, current_date, 
                'IN', current_time, lat_float, lon_float, 'IN_PROGRESS',  # Insert values
                'IN', lat_float, lon_float                                # Update values
            ))

        # CASE 2: PUNCH OUT (2)
        elif punch_type_num == 2:
            cursor.execute("""
                UPDATE attendance SET
                    punch_type = 'OUT',      -- Store 'OUT'
                    punch_out_time = ?,
                    punch_out_latitude = ?,  -- Store Latitude
                    punch_out_longitude = ?, -- Store Longitude
                    status = 'COMPLETED'
                WHERE employee_id = ? AND date = ?
            """, (
                employee_id, current_date
            ))
            
            if cursor.rowcount == 0:
                conn.rollback()
                return jsonify({
                    'status': 'Error', 
                    'message': 'Cannot Punch Out: No active check-in found for today.'
                }), 400

        # Commit changes
        conn.commit()
        
        # 6. RETURN SUCCESS RESPONSE
        return jsonify({
            'status': 'Success',
            'message': 'Punch recorded successfully',
            'PunchType': punch_type_num,      # Return 1 or 2
            'PunchTypeName': punch_type_str,  # Return "IN" or "OUT"
            'Latitude': lat_float,
            'Longitude': lon_float
        })

    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        return jsonify({'status': 'Error', 'message': str(e)}), 500
```

---

## 🔍 How to Verify It Worked

After the backend developer applies this code, check the database:

### Query for Results
```sql
SELECT punch_type, punch_in_latitude, punch_in_longitude, punch_out_latitude 
FROM attendance 
WHERE date = CURRENT_DATE;
```

### ✅ Success Looks Like This:

| punch_type | punch_in_latitude | punch_in_longitude | punch_out_latitude |
|------------|-------------------|--------------------|--------------------|
| **IN**     | 21.1702           | 72.8311            | NULL               |
| **OUT**    | 21.1702           | 72.8311            | 21.1702            |

---

## ❌ Failure Looks Like This (What you have now):

| punch_type | punch_in_latitude | punch_in_longitude |
|------------|-------------------|--------------------|
| **-**      | **0**             | **0**              |

---

### Send this file to your backend developer immediately.
