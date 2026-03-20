import { INPUT_CLASS, LABEL_CLASS } from "../constants";
import { TabProps } from "../types";

export function SpecsTab({ formData, handleChange, type }: TabProps) {
    return (
        <div className="grid grid-cols-2 gap-6">
            {type === 'hosting' ? (
                <>
                    <div className="grid grid-cols-2 gap-4 col-span-2">
                        <div>
                            <label className={LABEL_CLASS}>Storage (GB)</label>
                            <input type="number" className={INPUT_CLASS} value={formData.storage_gb || ""} onChange={(e) => handleChange('storage_gb', parseInt(e.target.value))} />
                        </div>
                        <div>
                            <label className={LABEL_CLASS}>Storage Type</label>
                            <select className={INPUT_CLASS} value={formData.storage_type || ""} onChange={(e) => handleChange('storage_type', e.target.value)}>
                                <option value="SSD">SATA SSD</option>
                                <option value="NVMe">NVMe SSD</option>
                                <option value="HDD">HDD</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Web Server</label>
                        <input className={INPUT_CLASS} value={formData.web_server || ""} placeholder="LiteSpeed, NGINX, Apache..." onChange={(e) => handleChange('web_server', e.target.value)} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Control Panel</label>
                        <input className={INPUT_CLASS} value={formData.control_panel || ""} placeholder="cPanel, hPanel, Plesk..." onChange={(e) => handleChange('control_panel', e.target.value)} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Inode Limit</label>
                        <input type="number" className={INPUT_CLASS} value={formData.inodes || ""} onChange={(e) => handleChange('inodes', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Uptime Guarantee (%)</label>
                        <input className={INPUT_CLASS} value={formData.uptime_guarantee || ""} placeholder="99.9%" onChange={(e) => handleChange('uptime_guarantee', e.target.value)} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>PHP Versions (comma separated)</label>
                        <input className={INPUT_CLASS} value={formData.php_versions?.join(', ') || ""} onChange={(e) => handleChange('php_versions', e.target.value.split(',').map((s: string) => s.trim()))} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Databases Allowed</label>
                        <input className={INPUT_CLASS} value={formData.databases_allowed || ""} onChange={(e) => handleChange('databases_allowed', e.target.value)} />
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <label className={LABEL_CLASS}>Avg Speed (Mbps)</label>
                        <input type="number" className={INPUT_CLASS} value={formData.avg_speed_mbps || ""} onChange={(e) => handleChange('avg_speed_mbps', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Server Count</label>
                        <input type="number" className={INPUT_CLASS} value={formData.server_count || ""} onChange={(e) => handleChange('server_count', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Country Count</label>
                        <input type="number" className={INPUT_CLASS} value={formData.country_count || ""} onChange={(e) => handleChange('country_count', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>City Count</label>
                        <input type="number" className={INPUT_CLASS} value={formData.city_count || ""} onChange={(e) => handleChange('city_count', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Encryption Type</label>
                        <input className={INPUT_CLASS} value={formData.encryption_type || ""} placeholder="AES-256-GCM" onChange={(e) => handleChange('encryption_type', e.target.value)} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Jurisdiction</label>
                        <input className={INPUT_CLASS} value={formData.jurisdiction || ""} placeholder="Panama, BVI, Switzerland..." onChange={(e) => handleChange('jurisdiction', e.target.value)} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Protocols (comma separated)</label>
                        <input className={INPUT_CLASS} value={formData.protocols?.join(', ') || ""} onChange={(e) => handleChange('protocols', e.target.value.split(',').map((s: string) => s.trim()))} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Audits (comma separated)</label>
                        <input className={INPUT_CLASS} value={formData.audits?.join(', ') || ""} onChange={(e) => handleChange('audits', e.target.value.split(',').map((s: string) => s.trim()))} />
                    </div>
                </>
            )}
        </div>
    );
}
